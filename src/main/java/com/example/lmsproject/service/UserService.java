package com.example.lmsproject.service;

public interface UserService<T> extends ServiceInterface<T> {

    public T changePassword(String id, String password);

}
