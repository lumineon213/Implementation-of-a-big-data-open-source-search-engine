package com.boot.security;

import com.boot.login.dao.loginDAO;
import com.boot.login.dto.loginDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final loginDAO dao;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {

        loginDTO user = dao.findById(username);

        if (user == null) {
            throw new UsernameNotFoundException("사용자를 찾을 수 없습니다: " + username);
        }

        return new CustomUserDetails(user);
    }
}
