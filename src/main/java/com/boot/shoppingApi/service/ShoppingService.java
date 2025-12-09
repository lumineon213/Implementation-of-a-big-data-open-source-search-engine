package com.boot.shoppingApi.service;

import java.util.Map;

public interface ShoppingService {
    String syncShoppingData() throws Exception;
    Map<String, Object> searchShopping(String keyword, int page, int size) throws Exception;
}
