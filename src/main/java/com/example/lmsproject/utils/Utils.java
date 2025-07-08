package com.example.lmsproject.utils;

public class Utils {

    public static String getUUID(){
        return java.util.UUID.randomUUID().toString();
    }

    public static String nextId(String currentId){

        String[] idParts = currentId.split("-");
        int numLength = idParts[1].length();
        int idNum = Integer.parseInt(idParts[1]);
        idNum++;

        StringBuilder idNumStr = new StringBuilder(String.valueOf(idNum));

        for(int i = 1; i < numLength; i++){

            if (idNum < Math.pow(10, i)){
                idNumStr.insert(0, "0");
            }

        }

        return idParts[0] + "-" + idNumStr;

    }

}
