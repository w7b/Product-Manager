package com.productmanager.auth.service;
import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import javax.crypto.SecretKey;
import java.util.*;
import java.util.function.Function;
@Service @Slf4j
public class JwtService {
    @Value("${app.jwt.secret}") private String secret;
    @Value("${app.jwt.access-token-expiration}") private long accessExp;
    @Value("${app.jwt.refresh-token-expiration}") private long refreshExp;
    public String generateAccessToken(UserDetails u) { return build(new HashMap<>(), u, accessExp); }
    public String generateRefreshToken(UserDetails u) { Map<String,Object> c=new HashMap<>(); c.put("type","refresh"); return build(c,u,refreshExp); }
    private String build(Map<String,Object> claims, UserDetails u, long exp) {
        return Jwts.builder().claims(claims).subject(u.getUsername()).issuedAt(new Date()).expiration(new Date(System.currentTimeMillis()+exp)).signWith(key()).compact();
    }
    public boolean isTokenValid(String t, UserDetails u) { try { return extractUsername(t).equals(u.getUsername())&&!isExpired(t); } catch(JwtException e) { return false; } }
    public boolean isRefreshToken(String t) { try { return "refresh".equals(extractAllClaims(t).get("type")); } catch(JwtException e) { return false; } }
    public String extractUsername(String t) { return extractClaim(t, Claims::getSubject); }
    public long getAccessTokenExpiration() { return accessExp; }
    private boolean isExpired(String t) { return extractClaim(t,Claims::getExpiration).before(new Date()); }
    private <T> T extractClaim(String t, Function<Claims,T> f) { return f.apply(extractAllClaims(t)); }
    private Claims extractAllClaims(String t) { return Jwts.parser().verifyWith(key()).build().parseSignedClaims(t).getPayload(); }
    private SecretKey key() { return Keys.hmacShaKeyFor(Decoders.BASE64.decode(Base64.getEncoder().encodeToString(secret.getBytes()))); }
}
