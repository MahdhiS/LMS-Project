package com.example.lmsproject.service;

public interface ServiceTemplate<T> {

    public T create(T t);

    public T delete(String id);

    public T changePassword(String id, String password);

    public T update(T t);

}
