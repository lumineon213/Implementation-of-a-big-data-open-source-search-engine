package com.boot.controller;

import java.nio.ByteBuffer;
import java.security.SecureRandom;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.apache.commons.codec.binary.Base32;


public class GoogleOtpUtil {

    private static final int TIME_STEP = 30;
    private static final int DIGITS = 6;

    /** 🔑 Secret 생성 */
    public static String generateSecret() {
        SecureRandom random = new SecureRandom();
        byte[] bytes = new byte[20];
        random.nextBytes(bytes);
        return new Base32().encodeToString(bytes).replace("=", "");
    }

    /** ✅ OTP 검증 */
    public static boolean verifyCode(String secret, int code) {
        long timeWindow = System.currentTimeMillis() / 1000 / TIME_STEP;
        for (int i = -1; i <= 1; i++) {
            if (generateCode(secret, timeWindow + i) == code) {
                return true;
            }
        }
        return false;
    }

    private static int generateCode(String secret, long time) {
        try {
            Base32 base32 = new Base32();
            byte[] key = base32.decode(secret);

            ByteBuffer buffer = ByteBuffer.allocate(8);
            buffer.putLong(time);

            Mac mac = Mac.getInstance("HmacSHA1");
            mac.init(new SecretKeySpec(key, "HmacSHA1"));
            byte[] hash = mac.doFinal(buffer.array());

            int offset = hash[hash.length - 1] & 0xf;
            int binary =
                    ((hash[offset] & 0x7f) << 24) |
                    ((hash[offset + 1] & 0xff) << 16) |
                    ((hash[offset + 2] & 0xff) << 8) |
                    (hash[offset + 3] & 0xff);

            return binary % (int) Math.pow(10, DIGITS);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}