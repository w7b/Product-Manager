package com.productmanager.exception;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.*;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import java.time.LocalDateTime;
import java.util.*;
@RestControllerAdvice @Slf4j
public class GlobalExceptionHandler {
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> notFound(ResourceNotFoundException e) { return ResponseEntity.status(404).body(new ErrorResponse(404, e.getMessage())); }
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse> business(BusinessException e) { return ResponseEntity.status(409).body(new ErrorResponse(409, e.getMessage())); }
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponse> integrity(DataIntegrityViolationException e) {
        log.warn("Violação de integridade: {}", e.getMostSpecificCause().getMessage());
        return ResponseEntity.status(409).body(new ErrorResponse(409, "Operação viola uma regra do banco de dados (registro em uso ou duplicado)"));
    }
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ValidationErrorResponse> validation(MethodArgumentNotValidException e) {
        Map<String,String> errors = new HashMap<>();
        e.getBindingResult().getAllErrors().forEach(err -> errors.put(err instanceof FieldError f ? f.getField() : err.getObjectName(), err.getDefaultMessage()));
        return ResponseEntity.status(400).body(new ValidationErrorResponse(400,"Erro de validação",errors));
    }
    @ExceptionHandler({HttpMessageNotReadableException.class, MethodArgumentTypeMismatchException.class})
    public ResponseEntity<ErrorResponse> badRequest(Exception e) { return ResponseEntity.status(400).body(new ErrorResponse(400,"Requisição inválida: verifique os campos enviados")); }
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> access(AccessDeniedException e) { return ResponseEntity.status(403).body(new ErrorResponse(403,"Acesso negado")); }
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> general(Exception e) { log.error("Erro interno",e); return ResponseEntity.status(500).body(new ErrorResponse(500,"Erro interno do servidor")); }
    public record ErrorResponse(int status, String message, LocalDateTime timestamp) { public ErrorResponse(int s, String m) { this(s,m,LocalDateTime.now()); } }
    public record ValidationErrorResponse(int status, String message, Map<String,String> errors, LocalDateTime timestamp) { public ValidationErrorResponse(int s, String m, Map<String,String> e) { this(s,m,e,LocalDateTime.now()); } }
}
