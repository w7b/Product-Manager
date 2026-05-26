package com.productmanager.auth.service;
import com.productmanager.auth.dto.AuthDTO;
import com.productmanager.exception.BusinessException;
import com.productmanager.module.store.entity.Store;
import com.productmanager.module.store.repository.StoreRepository;
import com.productmanager.module.user.entity.User;
import com.productmanager.module.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
@Service @RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepo;
    private final StoreRepository storeRepo;
    private final PasswordEncoder encoder;
    private final JwtService jwt;
    private final AuthenticationManager authManager;
    @Transactional
    public AuthDTO.TokenResponse register(AuthDTO.RegisterRequest req) {
        if (userRepo.existsByEmail(req.email())) throw new BusinessException("Email já cadastrado");
        Store store = storeRepo.findByName(req.storeName()).orElseGet(() -> storeRepo.save(Store.builder().name(req.storeName()).build()));
        User user = userRepo.save(User.builder().name(req.name()).email(req.email()).password(encoder.encode(req.password())).store(store).build());
        return buildTokenResponse(user);
    }
    @Transactional(readOnly=true)
    public AuthDTO.TokenResponse login(AuthDTO.LoginRequest req) {
        try { authManager.authenticate(new UsernamePasswordAuthenticationToken(req.email(), req.password())); }
        catch (BadCredentialsException e) { throw new BusinessException("Credenciais inválidas"); }
        return buildTokenResponse(userRepo.findByEmail(req.email()).orElseThrow(() -> new BusinessException("Usuário não encontrado")));
    }
    @Transactional(readOnly=true)
    public AuthDTO.TokenResponse refreshToken(AuthDTO.RefreshTokenRequest req) {
        if (!jwt.isRefreshToken(req.refreshToken())) throw new BusinessException("Token inválido");
        String email = jwt.extractUsername(req.refreshToken());
        User user = userRepo.findByEmail(email).orElseThrow(() -> new BusinessException("Usuário não encontrado"));
        if (!jwt.isTokenValid(req.refreshToken(), user)) throw new BusinessException("Refresh token expirado");
        return new AuthDTO.TokenResponse(jwt.generateAccessToken(user), jwt.generateRefreshToken(user), "Bearer", jwt.getAccessTokenExpiration(), toInfo(user));
    }
    private AuthDTO.TokenResponse buildTokenResponse(User u) {
        return new AuthDTO.TokenResponse(jwt.generateAccessToken(u), jwt.generateRefreshToken(u), "Bearer", jwt.getAccessTokenExpiration(), toInfo(u));
    }
    private AuthDTO.UserInfo toInfo(User u) { return new AuthDTO.UserInfo(u.getId(), u.getName(), u.getEmail(), u.getStore().getName()); }
}
