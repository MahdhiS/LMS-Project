package com.example.lmsproject.service;

import java.util.Map;

public interface ServiceInterface<T> {

    public T create(T t);

    public T delete(String userName);

    public T update(T t);

    public Map<String, String> get(String userName);

}
