# Adding a new admin
curl -X POST -v \
  -H "Content-Type: application/json" \
  -d '{
    "username": "ravinduw",
    "password": "pw123",
    "firstName": "Ravindu",
    "lastName": "Wijesundara",
    "email": "r@rw.com",
    "phone": "+1234567890",
    "dateOfBirth": "2003-01-01",
    "gender": "Male"
  }' \
  http://localhost:8080/api/admin/newAdmin


# Adding a new lecturer
curl -X POST -v \
  -H "Content-Type: application/json" \
  -d '{
    "username": "lec1",
    "password": "pw123",
    "firstName": "Lecturer",
    "lastName": "One",
    "email": "l1@example.com",
    "phone": "+1234567890",
    "dateOfBirth": "1990-01-15",
    "gender": "Male"
  }' \
  http://localhost:8080/api/admin/newLecturer


# Change admin password
curl -X PUT -v \
  -H "Content-Type: application/json" \
  -d '{
    "userName": "ravinduw",
    "newPassword": "PW12345"
  }' \
  http://localhost:8080/api/admin/changePassword


# Change lecturer password
curl -X PUT -v \
  -H "Content-Type: application/json" \
  -d '{
    "userName": "lec1",
    "newPassword": "Maths"
  }' \
  http://localhost:8080/api/lecturer/changePassword


# Delete admin
curl -X DELETE -v -i "http://localhost:8080/api/admin/deleteAdmin/ravinduw"


# Update lecturer
curl -X PUT -v   -H "Content-Type: application/json"   -d '{
    "dateOfBirth": "1990-01-15",
    "email": "l2@uni.com",
    "firstName": "Lecturer",
    "gender": "Male",
    "lastName": "Two",
    "phone": "+1234567890"
    }'   http://localhost:8080/api/lecturer/update/LEC-00001 # Lecturer ID


# Update admin
curl -X PUT -v   -H "Content-Type: application/json"   -d '{
    "dateOfBirth": "1990-01-15",
    "email": "l2@uni.com",
    "firstName": "Admin",
    "gender": "Male",
    "lastName": "One",
    "phone": "+1234567890"
    }'   http://localhost:8080/api/admin/update/ravinduw # User name


# Get details of a lecturer
curl -X GET -v "http://localhost:8080/api/lecturer/get/LEC-00001" # Lecturer ID


# Get details of an admin
curl -X GET -v "http://localhost:8080/api/admin/get/ravinduw" # Admin user name


# Make lecturer LIC
curl -X GET -v "http://localhost:8080/api/admin/makeLic/LEC-00001" # Lecturer ID


# Make lecturer non-LIC
curl -X GET -v "http://localhost:8080/api/admin/removeLic/LEC-00001" # Lecturer ID


# Delete lecturer
curl -X DELETE -v "http://localhost:8080/api/admin/deleteLecturer/LEC-00001" # Lecturer ID