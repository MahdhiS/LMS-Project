package com.example.lmsproject.service;

import java.util.Map;

public interface ServiceInterface<T> {

    public T create(T t);

    public boolean delete(String userName);

    public T update(T t, String id);

    public Map<String, String> get(String userName);

}
