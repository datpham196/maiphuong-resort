| ![](images/image1.png) | CÔNG TY CỔ PHẦN NEUTRON<br><br>**Địa chỉ**: K02/34 Đinh Thị Hòa, Phường An Hải, Thành phố Đà Nẵng, Việt Nam<br><br>**Hotline**: 0854.454.454 – **Email**: [info.neutron.jsc@gmail.com](mailto:info.neutron.jsc@gmail.com)<br><br>**Website**: <https://onepms.net/> |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |

# TÀI LIỆU TÍCH HỢP ONEPMS API

Mục Lục

Contents

1\. [Mô Tả 3](#1-mô-tả)

2\. [API lấy danh sách khách sạn 3](#2-api-lấy-danh-sách-khách-sạn)

2.1 Header 3

2.2 Body 3

3\. [API lấy danh sách hạng phòng 5](#3-api-lấy-danh-sách-hạng-phòng)

3.1 Header 5
 
3.2 Body 5

4\. [API lấy danh sách phòng 7](#4-api-lấy-danh-sách-phòng)

4.1 Header 7

4.2 Body 8

5\. [API lấy danh sách dịch vụ 11](#5-api-lấy-danh-sách-dịch-vụ)

5.1 Header 11

5.2 Body 11

6\. [API lấy danh sách phương thức thanh toán 17](#6-api-lấy-danh-sách-phương-thức-thanh-toán)

6.1 Header 17

6.2 Body 17

7\. [API kiểm tra số lượng phòng trống và giá 19](#7-api-kiểm-tra-số-lượng-phòng-trống-và-giá)

7.1 Header 19

7.2 Body 19

8\. [API đặt phòng 22](#8-api-đặt-phòng)

8.1 Header 22

8.2 Body 22

9\. [API thêm dịch vụ cho đặt phòng 26](#9-api-thêm-dịch-vụ-cho-đặt-phòng)

9.1 Header 26

9.2 Body 26

10\. [API lấy chi tiết đặt chỗ 31](#10-api-lấy-chi-tiết-đặt-chỗ)

10.1 Header 31

10.2 Body 32

11\. [API lấy danh sách đặt phòng 39](#11-api-lấy-danh-sách-đặt-phòng)

11.1 Header 39

11.2 Body 40

12\. [API lấy danh khách hàng 44](#12-api-lấy-danh-khách-hàng)

12.1 Header 44

12.2 Body 44

13\. [API cập nhật đặt phòng 47](#13-api-cập-nhật-đặt-phòng)

13.1 Header 47

13.2 Body 48

14\. [API thêm thanh toán 50](#14-api-thêm-thanh-toán)

14.1 Header 50

14.2 Body 50

15\. [API cập nhật dịch vụ 52](#15-api-cập-nhật-dịch-vụ)

15.1 Header 52

15.2 Body 52

16\. [API xóa dịch vụ 54](#16-api-xóa-dịch-vụ)

16.1 Header 54

16.2 Body 54

17\. [API nhận phòng 56](#17-api-nhận-phòng)

17.1 Header 56

17.2 Body 56

18\. [API hủy đặt phòng 57](#18-api-hủy-đặt-phòng)

18.1 Header 57

18.2 Body 57

19\. [Bảng mã lỗi 59](#19-bảng-mã-lỗi)

# 1. Mô Tả

Thông tin xác thực User với chuỗi mã hóa theo CryptoJS.AES.encrypt.

- Bao gồm thông tin sau.
  - **secretKey**: "OnePMS sẽ cung cấp".
  - **account**: "email:password".

\* Lưu ý: Tài khoản Email và Password là tài khoản đang sử dụng trên hệ thống OnePMS được cấp quyền gọi API.

# 2. API lấy danh sách khách sạn

| **URL**    | <https://us-central1-neutron-pms.cloudfunctions.net/api-fetchHotelList> |
| ---------- | ----------------------------------------------------------------------- |
| **Method** | POST                                                                    |

2.1 Header

| **Authentication**  | CryptoJS.AES.encrypt(account, secretKey).toString() |
| ------------------- | --------------------------------------------------- |
| **Content-Type**    | application/json                                    |
| **Accept-Language** | vi - en                                             |

2.2 Body

- **Chuỗi json dữ liệu**

{

"hotelIDs": \[\]

}

# Đặc tả chi tiết dữ liệu

| Tên trường | Loại dữ liệu       | Mô tả                                                                                                                                         |
| ---------- | ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| hotelIDs   | List&lt;String&gt; | Danh sách chứa chuỗi ID của khách sạn bạn đang dùng trên hệ thống OnePMS.<br><br>\* Lưu ý: nếu để trống hoặc không truyền giá trị thì, sẽ lấy |

|     |     | tất cả khách sạn mà tài khoản đang có quyền. |
| --- | --- | -------------------------------------------- |

- **Đầu ra:** Trả về chuỗi kết quả json với định dạng

{

result: "00",

message: " ", data:

\[

{

hotelID: "BDqEAcmb73mkkTpmHC5m", name: "X OnePmsTest",

email: "[onepmstest@gmail.com](mailto:onepmstest@gmail.com)", phone: "0293029342",

street: "44 hoa nam2", city: "Đà Nẵng", country: "Vietnam",

currencyCode: "Viet Nam Dong",

},

{

hotelID: "c9DNrzYtVxog1kDc5X13", name: "Treetopia - Neutron TESTING", email: "[treetopia@gmail.com](mailto:treetopia@gmail.com)",

phone: "03333686868",

street: "Lô 7 9 Le Van Quy, Phường Hòa Minh, Quận Ngũ Hành Sơn, Thành Phố Đà Nẵng",

city: "Đà Nẵng", country: "Vietnam",

currencyCode: "Viet Nam Dong",

},

\],

}

# Đặc tả chi tiết dữ liệu

| Tên trường | Mô tả |
| ---------- | ----- |

| result   | Mã kết quả gửi về.<br><br>00: Thành công                      |
| -------- | ------------------------------------------------------------- |
| message  | Nội dung thống báo nếu có lỗi<br><br>xảy ra.                  |
| **data** | Dữ liệu được trả về phía client<br><br>dưới dạng List object. |

# Data

| Tên trường   | Mô tả                                           |
| ------------ | ----------------------------------------------- |
| hotelID      | Mã của khách sạn.                               |
| name         | Tên của khách sạn.                              |
| email        | Email của khách sạn.                            |
| phone        | Số điện thoại của khách sạn.                    |
| street       | Tên đường (thuộc địa chỉ<br><br>khách sạn).     |
| city         | Tên thành phố (thuộc địa chỉ<br><br>khách sạn). |
| country      | Tên quốc gia (thuộc địa chỉ<br><br>khách sạn).  |
| currencyCode | Đơn vị tiền tệ.                                 |

# 3. API lấy danh sách hạng phòng

| **URL**    | <https://us-central1-neutron-pms.cloudfunctions.net/api-getRoomTypes> |
| ---------- | --------------------------------------------------------------------- |
| **Method** | POST                                                                  |

3.1 Header

| **Authentication**  | CryptoJS.AES.encrypt(account, secretKey).toString() |
| ------------------- | --------------------------------------------------- |
| **Content-Type**    | application/json                                    |
| **Accept-Language** | vi - en                                             |

3.2 Body

- **Chuỗi json dữ liệu**

{

"hotelID": "id khách sạn"

}

# Đặc tả chi tiết dữ liệu

| Tên trường | Loại dữ liệu      | Mô tả                                         |
| ---------- | ----------------- | --------------------------------------------- |
| hotelID    | String (Bắt buộc) | Mã khách sạn bạn đã lấy<br><br>được trước đó. |

- **Đầu ra:** Trả về chuỗi kết quả json định dạng

{

'result': "00", 'message':

' ', 'data': \[

{

name: 'Double', guest: 2, beds: \[Array\], num: 4,

price: 400000, roomTypeID: 'double'

},

{

name: 'SUITE',

guest: 2, beds: \[Array\], num: 4,

price: 500000, roomTypeID: 'suite'

},

\]

}

- Đặc tả chi tiết dữ liệu

| Tên trường | Mô tả                                                         |
| ---------- | ------------------------------------------------------------- |
| result     | Mã kết quả gửi về.<br><br>00: Thành công                      |
| message    | Nội dung thống báo nếu có lỗi<br><br>xảy ra.                  |
| data       | Dữ liệu được trả về phía client<br><br>dưới dạng List object. |

# Data

| Tên trường | Mô tả                                                        |
| ---------- | ------------------------------------------------------------ |
| roomTypeID | Mã hạng phòng.                                               |
| name       | Tên hạng phòng.                                              |
| guest      | Số khách chứa tối đa trong<br><br>phòng thuộc hạng phòng đó. |
| beds       | Danh sách giường.                                            |
| price      | Đơn giá của hạng phòng                                       |
| num        | Số lượng phòng đang có của<br><br>hạng phòng                 |

# 4. API lấy danh sách phòng

| **URL**    | <https://us-central1-neutron-pms.cloudfunctions.net/api-getRooms> |
| ---------- | ----------------------------------------------------------------- |
| **Method** | POST                                                              |

4.1 Header

| **Authentication**  | CryptoJS.AES.encrypt(account, secretKey).toString() |
| ------------------- | --------------------------------------------------- |
| **Content-Type**    | application/json                                    |
| **Accept-Language** | vi - en                                             |

4.2 Body

- Chuỗi json dữ liệu

{

"hotelID": "id khách sạn" "roomTypeID": ""

}

- Đặc tả chi tiết dữ liệu

| Tên trường | Loại dữ liệu      | Mô tả                                         |
| ---------- | ----------------- | --------------------------------------------- |
| hotelID    | String (Bắt buộc) | Mã khách sạn bạn đã lấy<br><br>được trước đó. |
| roomTypeID | String            | Để lấy dang sách phòng theo hạng cần lấy      |

- **Đầu ra:** Trả về chuỗi kết quả json định dạng

{

"result": "00",

"message": "", "data": \[

{

"roomID": "101",

"roomName": "101",

"floorName": "TA1", "bedTypes": \[

"Double"

\],

"roomTypeID": "db",

"roomTypeName": "Double", "maxGuest": 2

},

{

"note": "",

"roomID": "102",

"roomName": "102",

"floorName": "TA1", "bedTypes": \[

"Double"

\],

"roomTypeID": "db", "roomTypeName": "Double", "maxGuest": 2

},

{

"roomID": "103",

"roomName": "103",

"floorName": "TA1", "bedTypes": \[

"Double"

\],

"roomTypeID": "db", "roomTypeName": "Double", "maxGuest": 2

},

{

"roomID": "104",

"roomName": "104",

"floorName": "TA1", "bedTypes": \[

"Double"

\],

"roomTypeID": "db", "roomTypeName": "Double",

"maxGuest": 2

},

{

"roomID": "105",

"roomName": "105",

"floorName": "TA1", "bedTypes": \[

"Double"

\],

"roomTypeID": "db", "roomTypeName": "Double", "maxGuest": 2

}

\]

}

- Đặc tả chi tiết dữ liệu

| Tên trường | Mô tả                                                         |
| ---------- | ------------------------------------------------------------- |
| result     | Mã kết quả gửi về.<br><br>00: Thành công                      |
| message    | Nội dung thống báo nếu có lỗi<br><br>xảy ra.                  |
| data       | Dữ liệu được trả về phía client<br><br>dưới dạng List object. |

# Data

| Tên trường | Mô tả                  |
| ---------- | ---------------------- |
| roomID     | Mã phòng.              |
| roomName   | Tên phòng.             |
| floorName  | Tên tầng               |
| bedTypes   | Danh sách loại giường. |
| roomTypeID | Mã hạng phòng          |

| roomTypeName | Tên hạng phòng        |
| ------------ | --------------------- |
| maxGuest     | Số lượng khách tối đa |

# 5. API lấy danh sách dịch vụ

| **URL**    | <https://us-central1-neutron-pms.cloudfunctions.net/api-getServices> |
| ---------- | -------------------------------------------------------------------- |
| **Method** | POST                                                                 |

5.1 Header

| **Authentication**  | CryptoJS.AES.encrypt(account, secretKey).toString() |
| ------------------- | --------------------------------------------------- |
| **Content-Type**    | application/json                                    |
| **Accept-Language** | vi - en                                             |

5.2 Body

- **Chuỗi json dữ liệu**

{

"hotelID": "id khách sạn" "serviceCategory": "laundry"

}

# Đặc tả chi tiết dữ liệu

| Tên trường      | Loại dữ liệu      | Mô tả                                         |
| --------------- | ----------------- | --------------------------------------------- |
| hotelID         | String (Bắt buộc) | Mã khách sạn bạn đã lấy<br><br>được trước đó. |
| serviceCategory | String            | Để lấy dang sách dịch vụ theo thể loại        |

- **Đầu ra:** Trả về chuỗi kết quả json định dạng

{

"result": "00",

"message": "", "data": {

"minibar": \[

{

"unit": "cup",

"name": "Giấy vuông 1m", "type": "minibar", "sellPrice": 10000, "itemID": "7PEP3rFpL"

},

{

"unit": "liter",

"name": "Khăn lạnh không in logo", "type": "minibar",

"sellPrice": 22222, "itemID": "7PEP3rG80"

},

{

"unit": "can",

"name": "Trà xanh không độ 1ml", "type": "minibar",

"sellPrice": 100000, "itemID": "7PEP3rFkj"

},

{

"name": "Bia Huda",

"unit": "glass",

"type": "minibar", "sellPrice": 100000, "itemID": "biahuda"

},

{

"unit": "jar",

"name": "lala",

"type": "minibar", "sellPrice": 10000, "itemID": "7PFbyONSd"

}

\],

"restaurant": \[

{

"unit": "glass",

"name": "Coca", "type": "restaurant", "sellPrice": 100000,

"itemID": "7PEP3rG3h"

},

{

"unit": "tube",

"name": "Bao đũa in logo", "type": "restaurant", "sellPrice": 10000, "itemID": "7PEP3rGqx"

}

\],

"extraGuest": \[

{

"child": 160000,

"adult": 220000, "type": "extra_guest"

}

\],

"laundry": \[

{

"piron": 15000,

"plaundry": 20000, "name": "Váy BabyDoll",

"laundryID": "vaybabydoll", "type": "laundry"

},

{

"plaundry": 20000,

"piron": 12000, "name": "Váy",

"laundryID": "vay",

"type": "laundry"

},

{

"name": "Ao dai", "piron": 200000,

"plaundry": 300000, "laundryID": "aodai", "type": "laundry"

},

{

"plaundry": 20000,

"piron": 10000, "name": "Tee ao",

"laundryID": "tee1",

"type": "laundry"

}

\],

"bikeRental": \[

{

"price": 1500000, "type": "bike_rental", "bakeID": "55"

},

{

"price": 150000, "type": "bike_rental", "bakeID": "77"

},

{

"price": 150000, "type": "bike_rental", "bakeID": "90"

},

{

"price": 200000, "type": "bike_rental", "bakeID": "554"

},

{

"price": 200000, "type": "bike_rental", "bakeID": "66678"

}

\]

}

}

- Đặc tả chi tiết dữ liệu

| Tên trường | Mô tả                                                         |
| ---------- | ------------------------------------------------------------- |
| result     | Mã kết quả gửi về.<br><br>00: Thành công                      |
| message    | Nội dung thống báo nếu có lỗi<br><br>xảy ra.                  |
| data       | Dữ liệu được trả về phía client<br><br>dưới dạng List object. |

# Data

| Tên trường                                              | Mô tả        |
| ------------------------------------------------------- | ------------ |
| minibar restaurant extraGuest laundry<br><br>bikeRental | Nhóm dịch vụ |

# Minibar

| Tên trường | Mô tả        |
| ---------- | ------------ |
| itemID     | Mã mặt hàng  |
| name       | Tên mặt hàng |
| type       | Loại dịch vụ |
| unit       | Đơn vị       |
| sellPrice  | Gía bán      |

# Restaurant

| Tên trường | Mô tả        |
| ---------- | ------------ |
| itemID     | Mã mặt hàng  |
| name       | Tên mặt hàng |
| type       | Loại dịch vụ |
| unit       | Đơn vị       |
| sellPrice  | Gía bán      |

# ExtraGuest

| Tên trường | Mô tả         |
| ---------- | ------------- |
| child      | Giá Trẻ em    |
| adult      | Giá Người lớn |
| type       | Loại dịch vụ  |

# Laundry

| Tên trường | Mô tả                |
| ---------- | -------------------- |
| laundryID  | Mã giặt ủi           |
| name       | Tên mặt hàng giặt ủi |

| plaundry | Giá giặt     |
| -------- | ------------ |
| piron    | Giá ủi       |
| type     | Loại dịch vụ |

# bikeRental

| Tên trường | Mô tả                                              |
| ---------- | -------------------------------------------------- |
| bakeID     | Mã xe                                              |
| price      | Giá thuê                                           |
| bikeType   | Loại xe Lưu ý:<br><br>manual = xe máy auto = xe ga |
| type       | Loại dịch vụ                                       |

# 6. API lấy danh sách phương thức thanh toán

| **URL**    | [https://us-central1-neutron-pms.cloudfunctions.net/api-](https://us-central1-neutron-pms.cloudfunctions.net/api-checkAvailabilityAndRate)getPaymentMethods |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Method** | POST                                                                                                                                                        |

6.1 Header

| **Authentication**  | CryptoJS.AES.encrypt(account, secretKey).toString() |
| ------------------- | --------------------------------------------------- |
| **Content-Type**    | application/json                                    |
| **Accept-Language** | vi - en                                             |

6.2 Body

- Chuỗi json dữ liệu

{

"hotelID": 'Chuỗi id khách sạn',

}

- Đặc tả chi tiết dữ liệu

| Tên trường | Loại dữ liệu      | Mô tả                                                                                                                       |
| ---------- | ----------------- | --------------------------------------------------------------------------------------------------------------------------- |
| hotelID    | String (Bắt buộc) | Mã khách sạn bạn đã lấy được trước đó, để lấy thông tin số lượng phòng còn trống của hạng mà khách sạn bạn<br><br>muốn lấy. |

- **Đầu ra:** Trả về chuỗi kết quả json định dạng

{

"result": "00",

"message": "", "data": \[

{

"name": "Credit card", "paymentMethodID": "cc"

},

{

"name": "Cici bank", "paymentMethodID": "Cc"

}

\]

}

# Đặc tả chi tiết dữ liệu

| Tên trường | Mô tả |
| ---------- | ----- |

| result  | Mã kết quả gửi về.<br><br>00: Thành công                      |
| ------- | ------------------------------------------------------------- |
| message | Nội dung thống báo nếu có lỗi<br><br>xảy ra.                  |
| data    | Dữ liệu được trả về phía client<br><br>dưới dạng List object. |

# Data

| Tên trường      | Mô tả            |
| --------------- | ---------------- |
| paymentMethodID | Mã phương thức.  |
| name            | Tên phương thức. |

# 7. API kiểm tra số lượng phòng trống và giá

| **URL**    | <https://us-central1-neutron-pms.cloudfunctions.net/api-checkAvailabilityAndRate> |
| ---------- | --------------------------------------------------------------------------------- |
| **Method** | POST                                                                              |

7.1 Header

| **Authentication**  | CryptoJS.AES.encrypt(account, secretKey).toString() |
| ------------------- | --------------------------------------------------- |
| **Content-Type**    | application/json                                    |
| **Accept-Language** | vi - en                                             |

7.2 Body

- Chuỗi json dữ liệu

{

"hotelID": 'Chuỗi id khách sạn',

"roomTypeIDs": \["roomTypeID1", "roomTypeID2"\], "arrivalDate": "14/07/2025",

"departureDate": "31/07/2025"

}

- Đặc tả chi tiết dữ liệu

| Tên trường    | Loại dữ liệu       | Mô tả                                                                                                                                                     |
| ------------- | ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| hotelID       | String (Bắt buộc)  | Mã khách sạn bạn đã lấy được trước đó, để lấy thông tin số lượng phòng còn trống của hạng mà khách sạn bạn<br><br>muốn lấy.                               |
| roomTypeIDs   | List&lt;String&gt; | Danh sách chứa chuỗi ID của hạng phòng bạn cần lấy.<br><br>\* Lưu ý: nếu để trống hoặc không truyền giá trị thì, sẽ lấy tất cả hạng phòng đang hoạt động. |
| arrivalDate   | String (Bắt buộc)  | Ngày nhận phòng. Dạng chuỗi theo định dạng dd/MM/YYYY.<br><br>VD: 25/03/2025                                                                              |
| departureDate | String (Bắt buộc)  | Ngày trả phòng.<br><br>Dạng chuỗi theo định dạng dd/MM/YYYY.<br><br>VD: 28/03/2025.                                                                       |

- **Đầu ra:** Trả về chuỗi kết quả json định dạng

{ "result": "00",

"message": "", "data": \[

{

"roomTypeID": "double", "name":

"Double", "amount": 4, "dailyRates": \[

{

"date": "16/07/2025",

"rate": 300000

},

{

"date": "17/07/2025",

"rate": 300000

},

{

"date": "18/07/2025",

"rate": 300000

},

{

"date": "19/07/2025",

"rate": 300000

}

\]

}

\]

}

# Đặc tả chi tiết dữ liệu

| Tên trường | Mô tả                                                         |
| ---------- | ------------------------------------------------------------- |
| result     | Mã kết quả gửi về.<br><br>00: Thành công                      |
| message    | Nội dung thống báo nếu có lỗi<br><br>xảy ra.                  |
| data       | Dữ liệu được trả về phía client<br><br>dưới dạng List object. |

# Data

| Tên trường | Mô tả           |
| ---------- | --------------- |
| roomTypeID | Mã hạng phòng.  |
| name       | Tên hạng phòng. |

| amount     | Số lượng phòng khả dụng của<br><br>hạng phòng.        |
| ---------- | ----------------------------------------------------- |
| dailyRates | Danh sách Đơn giá theo ngày<br><br>của hạng phòng đó. |

# 8. API đặt phòng

| **URL**    | <https://us-central1-neutron-pms.cloudfunctions.net/api-addBooking> |
| ---------- | ------------------------------------------------------------------- |
| **Method** | POST                                                                |

8.1 Header

| **Authentication**  | CryptoJS.AES.encrypt(account, secretKey).toString() |
| ------------------- | --------------------------------------------------- |
| **Content-Type**    | application/json                                    |
| **Accept-Language** | vi - en                                             |

8.2 Body

- Chuỗi json dữ liệu

{

"hotelID": 'Chuỗi id khách sạn', "name": "Nguyen Van A", "phone": "0983336868",

"email": "[oenpmstest@gmail.com](mailto:oenpmstest@gmail.com)", "notes": "No br",

"arrivalDate": "14/07/2025", "departureDate": "15/07/2025", "paymentMethodID": 'mo', "paymentAmount": 400000.0, "rooms": \[

{

"roomTypeID": "double",

"breakfast": false, "adult": 2,

"child": 0,

"rates": \[ 200000.0

\]

},

{

"roomTypeID": "suite", "breakfast": true, "adult": 2,

"child": 0,

" rates": \[ 200000.0

\]

},

\],

}

- Đặc tả chi tiết dữ liệu

| Tên trường | Loại dữ liệu      | Mô tả                                         |
| ---------- | ----------------- | --------------------------------------------- |
| hotelID    | String (Bắt buộc) | Mã khách sạn bạn đã<br><br>lấy được trước đó. |
| name       | String (Bắt buộc) | Tên khách khi đặt phòng.                      |
| phone      | String            | Số điện thoại của khách hàng.                 |
| email      | String            | Email của khách hàng.                         |
| notes      | String            | Thông tin ghi chú về đặt phòng về hệ thống.   |

| arrivalDate     | String (Bắt buộc)                                        | Ngày bắt đầu nhận phòng của khách hàng. Dạng chuỗi theo định dạng dd/MM/YYYY. VD:<br><br>17/07/2025.                                                                                                                                                                                                                                          |
| --------------- | -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| departureDate   | String (Bắt buộc)                                        | Ngày trả phòng của khách hàng.<br><br>Dạng chuỗi theo định dạng dd/MM/YYYY. VD:<br><br>18/07/2025.                                                                                                                                                                                                                                            |
| paymentMethodID | String (\* Bắt buộc khi có số tiền thanh toán lớn hơn 0) | Mã phương thức thanh toán này sẽ được tạo và lấy trên hệ thống OnePMS.<br><br>\* b1: Truy cập vào hệ thống OnePMS<br><br>\* b2: Vào phần Menu -<br><br>\> Configuration<br><br>\* b3: Chọn vào phần Payment tại đây sẽ là phương thức thanh toán, bạn có thể tạo và lấy mã phương thức tại đây.<br><br>\* Lưu ý: lấy mã không lấy tên để gửi. |
| paymentAmount   | String                                                   | Số tiền khách thanh toán trực tuyến.                                                                                                                                                                                                                                                                                                          |
| rooms           | List object (Bắt buộc)                                   | Danh sách chứa thông tin và số lượng phòng của khách hàng đặt.                                                                                                                                                                                                                                                                                |

# Rooms

| Tên trường | Loại dữ liệu                   | Mô tả                                                                |
| ---------- | ------------------------------ | -------------------------------------------------------------------- |
| roomTypeID | String (Bắt buộc)              | Mã hạng phòng khách đã đặt.                                          |
| breakfast  | Boolean (Bắt buộc)             | Đặt phòng này có ăn sang hay không.                                  |
| adult      | Number (Bắt buộc)              | Số lượng khách người lớn khi đặt phòng.                              |
| child      | Number (Bắt buộc)              | Số lượng khách trẻ em khi đặt phòng.                                 |
| rates      | List&lt;Number &gt; (Bắt buộc) | Danh sach chứa số tiền phòng tương ứng theo từng ngày của đặt phòng. |

- **Đầu ra:** Trả về chuỗi kết quả json định dạng

{

"result": "00",

"message": "", "data": \[

{

"bookingIDs": \[Id1, Id2\], "bookingReference":"ssdk", "created": "30/07/2025"

}

\]

}

- Đặc tả chi tiết dữ liệu

| Tên trường | Mô tả                                                         |
| ---------- | ------------------------------------------------------------- |
| result     | Mã kết quả gửi về.<br><br>00: Thành công                      |
| message    | Nội dung thống báo nếu có lỗi<br><br>xảy ra.                  |
| data       | Dữ liệu được trả về phía client<br><br>dưới dạng List object. |

# Data

| Tên trường       | Mô tả                                                                                                  |
| ---------------- | ------------------------------------------------------------------------------------------------------ |
| bookingIDs       | Danh sách mã đặt phòng được tạo trên hệ thống OnePMS.<br><br>\*Lưu ý mã này dùng hủy<br><br>đặt phòng. |
| bookingReference | Mã tham chiếu của đặt phòng.                                                                           |
| created          | Thời gian tạo đặt phòng.                                                                               |

# 9. API thêm dịch vụ cho đặt phòng

| **URL**    | [https://us-central1-neutron-pms.cloudfunctions.net/api-createService](https://us-central1-neutron-pms.cloudfunctions.net/api-checkAvailabilityAndRate) |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Method** | POST                                                                                                                                                    |

9.1 Header

| **Authentication** | CryptoJS.AES.encrypt(account, secretKey).toString() |
| ------------------ | --------------------------------------------------- |
| **Content-Type**   | application/json                                    |

9.2 Body

- Chuỗi json dữ liệu

# \- Mẫu loại dich vụ Restaurant, Minibar

{

"hotelID": "c9DNrzYtVxog1kDc5X13", "serviceCategory": "restaurant or minibar", "bookingID": "8a2T614NM", "bookingReference": "T-NT003322", "items": {

"7PEP3rG3h": {

"price": 100000,

"amount": 1

},

},

"notes": "Vui lòng test lại", "serviceTotal": 220000

}

# \- Mẫu loại dich vụ Laundry

{

"hotelID": "c9DNrzYtVxog1kDc5X13", "serviceCategory": "laundry", "bookingID": "8a2T614NM", "bookingReference": "T-NT003322", "items": {

"aodai": {

"laundry": { "price": 300000,

"amount": 1

},

"iron": {

"price": 200000,

"amount": 1

}

}

},

"notes": "Vui lòng test lại", "serviceTotal": 220000

}

# \- Mẫu loại dich vụ ExtraGuest

{

"hotelID": "c9DNrzYtVxog1kDc5X13", "serviceCategory": "extra_guest ", "bookingID": "8a2T614NM", "bookingReference": "T-NT003322", "serviceTotal": 220000,

"serviceType": "adult", "serviceNumber": 1

}

# \- Mẫu loại dich vụ BikeRental

{

"hotelID": "c9DNrzYtVxog1kDc5X13", "serviceCategory": " bike_rental ", "bookingID": "8a2T614NM", "bookingReference": "T-NT003322", "serviceSupplier":"inhouse", "serviceBike": "55",

"servicePrice": 1500000

}

- Đặc tả chi tiết dữ liệu

| Tên trường      | Loại dữ liệu      | Mô tả                                                                                                                                    |
| --------------- | ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| hotelID         | String (Bắt buộc) | Mã khách sạn bạn đã lấy được trước đó, để lấy thông tin số lượng phòng còn trống của hạng hoặc dịch vụ mà khách sạn bạn<br><br>muốn lấy. |
| serviceCategory | String (Bắt buộc) | Là thể loại dịch vụ được đặt cho đặt phòng.<br><br>\*Bao gồm những mã sau:<br><br>\- minibar                                             |

|                  |                   | • restaurant<br>• extra_guest<br>• laundry<br>• bike_rental |
| ---------------- | ----------------- | ----------------------------------------------------------- |
| bookingID        | String (Bắt buộc) | Là mã đặt phòng của khách.                                  |
| bookingReference | String (Bắt buộc) | Mã tham chiếu của đặt phòng.                                |

# \- Nhóm dịch Restaurant, Minibar

| Tên trường   | Loại dữ liệu      | Mô tả                                                                         |
| ------------ | ----------------- | ----------------------------------------------------------------------------- |
| items        | Object (Bắt buộc) | Là danh sách mặt hàng khách muốn đặt bào gồm itemID, itemAmount và itemPrice. |
| notes        | String            | Mục ghi chú của khách khi đặt dịch vụ.                                        |
| serviceTotal | number (Bắt buộc) | Tổng tiền đơn hàng.                                                           |

# \- Nhóm dịch Laundry

| Tên trường | Loại dữ liệu      | Mô tả                                                                                                               |
| ---------- | ----------------- | ------------------------------------------------------------------------------------------------------------------- |
| items      | Object (Bắt buộc) | Là danh sách mặt hàng khách muốn đặt bào gồm itemID, itemAmount và itemPrice.<br><br>\*Lứu ý: mục này có giặt và ủi |

|              |                   | có id tương ứng như sau. Laundry = giặt.<br><br>Iron = ủi. |
| ------------ | ----------------- | ---------------------------------------------------------- |
| notes        | String            | Mục ghi chú của khách khi đặt dịch vụ.                     |
| serviceTotal | number (Bắt buộc) | Tổng tiền đơn hàng.                                        |

# \- Nhóm dịch ExtraGuest

| Tên trường    | Loại dữ liệu      | Mô tả                                                                             |
| ------------- | ----------------- | --------------------------------------------------------------------------------- |
| serviceType   | String (Bắt buộc) | Là loại dịch vụ có hai loại như sau:<br>• adult = Người lớn.<br>• child = Trẻ em. |
| serviceTotal  | number (Bắt buộc) | Tổng tiền đơn hàng.                                                               |
| serviceNumber | number (Bắt buộc) | Tổng số lượng khách muốn đặt.                                                     |

# \- Nhóm dịch BikeRental

| Tên trường      | Loại dữ liệu      | Mô tả                            |
| --------------- | ----------------- | -------------------------------- |
| serviceBike     | String (Bắt buộc) | Mã xe or loại xe khách muốn đặt. |
| serviceSupplier | number (Bắt buộc) | Nhà cung cấp xe cho thuê.        |

| servicePrice | number (Bắt buộc) | Gía thuê cho 1 xe theo nhà cung cấp. |
| ------------ | ----------------- | ------------------------------------ |

- **Đầu ra:** Trả về chuỗi kết quả json định dạng

{

"result": "00",

"message": "",

"data": \[\]

}

- Đặc tả chi tiết dữ liệu

| Tên trường | Mô tả                                                         |
| ---------- | ------------------------------------------------------------- |
| result     | Mã kết quả gửi về.<br><br>00: Thành công                      |
| message    | Nội dung thống báo nếu có lỗi<br><br>xảy ra.                  |
| data       | Dữ liệu được trả về phía client<br><br>dưới dạng List object. |

# 10. API lấy chi tiết đặt chỗ

| **URL**    | [https://us-central1-neutron-pms.cloudfunctions.net/api-](https://us-central1-neutron-pms.cloudfunctions.net/api-addBooking)getBookingDetails |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| **Method** | POST                                                                                                                                          |

10.1 Header

| **Authentication**  | CryptoJS.AES.encrypt(account, secretKey).toString() |
| ------------------- | --------------------------------------------------- |
| **Content-Type**    | application/json                                    |
| **Accept-Language** | vi - en                                             |

10.2 Body

- Chuỗi json dữ liệu

{

"hotelID": 'Chuỗi id khách sạn', "bookingReference": 'Mã tham chiếu',

}

- Đặc tả chi tiết dữ liệu

| Tên trường        | Loại dữ liệu      | Mô tả                                                     |
| ----------------- | ----------------- | --------------------------------------------------------- |
| hotelID           | String (Bắt buộc) | Mã khách sạn bạn đã<br><br>lấy được trước đó.             |
| bookingRefere nce | String (Bắt buộc) | Mã tham chiếu phòng<br><br>được đặt trên hệ thống OnePMS. |

- **Đầu ra:** Trả về chuỗi kết quả json định dạng

{

"result": "00",

"message": "", "data": \[

{

"bookingID": "T-NT002860",

"bookingReference": "T-NT002860", "hotelID": "c9DNrzYtVxog1kDc5X13", "name": "TNHS2",

"email": "",

"phone": "",

"arrivalDate": "29/01/2026", "departureDate": "30/01/2026", "bookingStatus": "confirmed", "idNumber": "",

"idType": "",

"address": "", "totalAmount": 1940000,

"totalPaid": 1940000,

"totalRemaining": 0, "paymentStatus": "paid", "rooms": \[

{

"roomTypeID": "db",

"roomNumber": "103",

"adult": 2,

"child": 0, "breakfast": false, "lunch": false, "dinner": false, "rates": \[

220000

\]

},

{

"roomTypeID": "db",

"roomNumber": "102",

"adult": 2,

"child": 0, "breakfast": false, "lunch": false, "dinner": false, "rates": \[

220000

\]

}

\],

"services": \[

{

"serviceID": "7PEP3rG3h", "serviceName": "Coca",

"serviceType": "inside_restaurant", "quantity": 1,

"unitPrice": 100000,

"totalPrice": 100000

},

{

"serviceID": "adult",

"serviceName": "Phụ thu người lớn", "serviceType": "extra_guest", "quantity": 1,

"unitPrice": 220000,

"totalPrice": 220000

},

{

"serviceID": "aodai", "serviceName": "Giặt Ao dai", "serviceType": "laundry", "quantity": 1,

"unitPrice": 300000,

"totalPrice": 300000

},

{

"serviceID": "tee1", "serviceName": "Giặt Tee ao", "serviceType": "laundry", "quantity": 1,

"unitPrice": 20000,

"totalPrice": 20000

},

{

"serviceID": "DPT", "serviceName": "Dọn phòng tháng", "serviceType": "other",

"quantity": 1,

"unitPrice": 100000,

"totalPrice": 100000

},

{

"serviceID": "manual", "serviceName": "Xe máy", "serviceType": "bike_rental", "quantity": 1,

"unitPrice": 150000,

"totalPrice": 150000

},

{

"serviceID": "7PEP3rFkj", "serviceName": "Trà xanh không độ 1ml", "serviceType": "minibar",

"quantity": 1,

"unitPrice": 100000,

"totalPrice": 100000

},

{

"serviceID": "aodai", "serviceName": "Giặt Ao dai", "serviceType": "laundry", "quantity": 1,

"unitPrice": 300000,

"totalPrice": 300000

},

{

"serviceID": "aodai", "serviceName": "Ủi Ao dai", "serviceType": "laundry", "quantity": 1,

"unitPrice": 200000,

"totalPrice": 200000

}

\],

"payments": \[

{

"paymentDate": "31/01/2026 3:03:05", "paymentMethodID": "ba", "paymentMethodName": "Bank", "amount": 1000000,

"paymentStatus": "paid", "transactionID": ""

},

{

"paymentDate": "31/01/2026 3:03:32", "paymentMethodID": "vn", "paymentMethodName": "VN Pay", "amount": 940000,

"paymentStatus": "paid", "transactionID": ""

}

\],

"created": "29/01/2026 11:42:30",

"updated": "31/01/2026 10:09:53",

"checkInTime": null, "checkOutTime": null, "notes": ""

}

\]

}

- Đặc tả chi tiết dữ liệu

| Tên trường | Mô tả                                        |
| ---------- | -------------------------------------------- |
| result     | Mã kết quả gửi về.<br><br>00: Thành công     |
| message    | Nội dung thống báo nếu có lỗi<br><br>xảy ra. |
| data       | Dữ liệu được trả về phía client              |

|     | dưới dạng List object. |
| --- | ---------------------- |

# Data

| Tên trường       | Mô tả                                                                                                                                                                                       |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| bookingID        | Mã đặt phòng.                                                                                                                                                                               |
| bookingReference | Mã đặt phòng được tạo trên hệ thống OnePMS.                                                                                                                                                 |
| hotelID          | Thời gian tạo đặt phòng.                                                                                                                                                                    |
| name             | Tên khách đặt phòng                                                                                                                                                                         |
| email            | Email khách đặt phòng                                                                                                                                                                       |
| phone            | Số điện thoại khách đặt phòng                                                                                                                                                               |
| arrivalDate      | Ngày nhận phòng.                                                                                                                                                                            |
| departureDate    | Ngày trả phòng                                                                                                                                                                              |
| bookingStatus    | Trạng thái đặt chỗ sẽ bao gồm:<br><br>\-1 = Trạng thái cancel.<br><br>\-2 = Trạng thái noshow.<br><br>0 = Trạng thái booked.<br><br>1 = Trạng thái checkIn.<br><br>2 = Trạng thái checkOut. |
| idNumber         | Số giấy tờ.                                                                                                                                                                                 |
| idType           | Loại giấy tờ bao gồm: "CMND".<br><br>"Passport". "Other".                                                                                                                                   |
| address          | Địa chỉ khách h                                                                                                                                                                             |
| totalAmount      | Tổng tiền phòng và dịch vụ của đặt phòng.                                                                                                                                                   |
| totalPaid        | Tổng tiền thanh toán.                                                                                                                                                                       |
| totalRemaining   | Tổng tiền còn lại sau khi đã trừ thanh toán.                                                                                                                                                |
| paymentStatus    | Trạng thái thanh toán bao gồm:<br><br>pending, partial, paid                                                                                                                                |
| rooms            | Danh sách phòng dưới                                                                                                                                                                        |

|          | dạng List object.                           |
| -------- | ------------------------------------------- |
| services | Danh sách dịch vụ dưới dạng List object.    |
| payments | Danh sách thanh toán dưới dạng List object. |
| created  | Ngày tạo đặt phòng.                         |
| updated  | Ngày cập nhật lần cuối.                     |

# Room

| Tên trường | Mô tả                                 |
| ---------- | ------------------------------------- |
| roomTypeID | Mã hạng phòng.                        |
| status     | Trạng thái của đặt phòng              |
| roomNumber | Số phòng khách đang ở.                |
| adult      | Số lượng người lớn.                   |
| child      | Số lượng trẻ em.                      |
| breakfast  | Có ăn sáng hay không                  |
| lunch      | Có ăn trưa hay không                  |
| dinner     | Có ăn tối hay không.                  |
| rates      | Danh sách tiền dưới dạng List object. |

# Services

| Tên trường  | Mô tả         |
| ----------- | ------------- |
| serviceID   | Mã dich vụ.   |
| serviceName | Tên dịch vụ.  |
| serviceType | Loại dịch vụ. |

| quantity   | Số lượng.  |
| ---------- | ---------- |
| unitPrice  | Đơn giá.   |
| totalPrice | Tổng tiền. |

# Payments

| Tên trường        | Mô tả                              |
| ----------------- | ---------------------------------- |
| paymentDate       | Thời gian thanh toán.              |
| paymentMethodID   | Mã phương thức thanh toán.         |
| paymentMethodName | Tên phương thức thanh<br><br>toán. |
| amount            | Số tiền thanh toán.                |
| paymentStatus     | Trạng thái thanh toán.             |
| transactionID     | Mã giao dịch (nếu có)              |

# 11. API lấy danh sách đặt phòng

| **URL**    | [https://us-central1-neutron-pms.cloudfunctions.net/api-](https://us-central1-neutron-pms.cloudfunctions.net/api-addBooking)<br><br>getBookingList |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Method** | POST                                                                                                                                               |

11.1 Header

| **Authentication**  | CryptoJS.AES.encrypt(account, secretKey).toString() |
| ------------------- | --------------------------------------------------- |
| **Content-Type**    | application/json                                    |
| **Accept-Language** | vi - en                                             |

11.2 Body

- Chuỗi json dữ liệu

{

"hotelID": "c9DNrzYtVxog1kDc5X13", "dateFrom": "28/01/2026",

"dateTo": "31/01/2026", "bookingStatus": \[

0,

1,

2

\],

"limit": 10,

"offset": 0

}

- Đặc tả chi tiết dữ liệu

| Tên trường    | Loại dữ liệu                        | Mô tả                                                                                                                                     |
| ------------- | ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| hotelID       | String (Bắt buộc)                   | Mã khách sạn bạn đã<br><br>lấy được trước đó.                                                                                             |
| dateFrom      | String (Bắt buộc)                   | Ngày bắt đầu.<br><br>Dạng chuỗi theo định dạng dd/MM/YYYY.                                                                                |
| dateTo        | String (Bắt buộc)                   | Ngày kết thúc.<br><br>Dạng chuỗi theo định dạng dd/MM/YYYY.                                                                               |
| bookingStatus | List&lt; number &gt;\[\] (Bắt buộc) | Danh sách trang thái phòng tương ứng như sau.<br><br>0 = Trạng thái booked.<br><br>1 = Trạng thái checkIn.<br><br>2 = Trạng thái checkOut |
| type          | String                              | Mặc định: created<br><br>Type: created, in_date, stay_days, updated                                                                       |

- **Đầu ra:** Trả về chuỗi kết quả json định dạng "result": "00",

"message": "", "data": \[

{

"bookingID": "86uJtMMKG", "bookingReference": "T-NT002858", "hotelID": "c9DNrzYtVxog1kDc5X13", "name": "ss",

"email": "",

"phone": "",

"arrivalDate": "28/01/2026", "departureDate": "29/01/2026", "bookingStatus": 1,

"totalAmount": 320000,

"totalPaid": 0, "paymentStatus": "pending", "rooms": \[

{

"roomTypeID": "db",

"roomNumber": "104",

"adult": 2,

"child": 0, "breakfast": false, "lunch": false, "dinner": false, "rates": \[

220000

\]

}

\],

"created": "28/01/2026 17:30:05",

"updated": "31/01/2026 9:46:26"

},

{

"bookingID": "86vJX66va", "bookingReference": "T-NT002859", "hotelID": "c9DNrzYtVxog1kDc5X13", "name": "NYHDS",

"email": "",

"phone": "",

"arrivalDate": "29/01/2026", "departureDate": "31/01/2026", "bookingStatus": 1,

"totalAmount": 530000,

"totalPaid": 530000, "paymentStatus": "paid", "rooms": \[

{

"roomTypeID": "db",

"roomNumber": "101",

"adult": 2,

"child": 0, "breakfast": false, "lunch": false, "dinner": false, "rates": \[

220000,

200000

\]

}

\],

"created": "29/01/2026 9:23:58",

"updated": "29/01/2026 13:53:30"

}

\]

}

- Đặc tả chi tiết dữ liệu

| Tên trường | Mô tả                                                         |
| ---------- | ------------------------------------------------------------- |
| result     | Mã kết quả gửi về.<br><br>00: Thành công                      |
| message    | Nội dung thống báo nếu có lỗi<br><br>xảy ra.                  |
| data       | Dữ liệu được trả về phía client<br><br>dưới dạng List object. |

# Data

| Tên trường       | Mô tả                                                                                                                                                                                       |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| bookingID        | Mã đặt phòng.                                                                                                                                                                               |
| bookingReference | Mã đặt phòng được tạo trên hệ thống OnePMS.                                                                                                                                                 |
| hotelID          | Thời gian tạo đặt phòng.                                                                                                                                                                    |
| name             | Tên khách đặt phòng                                                                                                                                                                         |
| email            | Email khách đặt phòng                                                                                                                                                                       |
| phone            | Số điện thoại khách đặt phòng                                                                                                                                                               |
| arrivalDate      | Ngày nhận phòng.                                                                                                                                                                            |
| departureDate    | Ngày trả phòng                                                                                                                                                                              |
| bookingStatus    | Trạng thái đặt chỗ sẽ bao gồm:<br><br>\-1 = Trạng thái cancel.<br><br>\-2 = Trạng thái noshow.<br><br>0 = Trạng thái booked.<br><br>1 = Trạng thái checkIn.<br><br>2 = Trạng thái checkOut. |
| totalAmount      | Tổng tiền phòng và dịch vụ của đặt phòng.                                                                                                                                                   |
| totalPaid        | Tổng tiền thanh toán.                                                                                                                                                                       |
| paymentStatus    | Trạng thái thanh toán bao gồm:<br><br>pending, partial, paid                                                                                                                                |
| rooms            | Dữ liệu được trả về phía client<br><br>dưới dạng List object.                                                                                                                               |

| created | Ngày tạo đặt phòng.     |
| ------- | ----------------------- |
| updated | Ngày cập nhật lần cuối. |

# Room

| Tên trường | Mô tả                                 |
| ---------- | ------------------------------------- |
| roomTypeID | Mã hạng phòng.                        |
| roomNumber | Số phòng khách đang ở.                |
| adult      | Số lượng người lớn.                   |
| child      | Số lượng trẻ em.                      |
| breakfast  | Có ăn sáng hay không                  |
| lunch      | Có ăn trưa hay không                  |
| dinner     | Có ăn tối hay không.                  |
| rates      | Danh sách tiền dưới dạng List object. |

# 12. API lấy danh khách hàng

| **URL**    | [https://us-central1-neutron-pms.cloudfunctions.net/api-](https://us-central1-neutron-pms.cloudfunctions.net/api-addBooking)getCustomers |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **Method** | POST                                                                                                                                     |

12.1 Header

| **Authentication**  | CryptoJS.AES.encrypt(account, secretKey).toString() |
| ------------------- | --------------------------------------------------- |
| **Content-Type**    | application/json                                    |
| **Accept-Language** | vi - en                                             |

12.2 Body

- Chuỗi json dữ liệu

{

"hotelID": "c9DNrzYtVxog1kDc5X13", "searchTerm": "Nguyen Van A", "limit": 100,

"offset": 0

}

- Đặc tả chi tiết dữ liệu

| Tên trường | Loại dữ liệu      | Mô tả                                                                             |
| ---------- | ----------------- | --------------------------------------------------------------------------------- |
| hotelID    | String (Bắt buộc) | Mã khách sạn bạn đã<br><br>lấy được trước đó.                                     |
| searchTerm | String (Bắt buộc) | Nội dùng cần tìm kiếm, sẽ lấy kết từ "Tên,SĐT,Email" có<br><br>chứa nội dung này. |
| limit      |                   | Số lượng giới hạn mỗi lần gọi                                                     |

- **Đầu ra:** Trả về chuỗi kết quả json định dạng

{

"result": "00",

"message": "", "data": \[

{

"customerID": "OMAykUOtUYJszTUqvinA", "name": "à13255",

"email": "",

"phone": "13535433",

"idNumber": "",

"idType": "CMND", "dateOfBirth": "31/01/2026", "address": "",

"vipStatus": false, "totalBookings": 1,

"totalSpent": 0, "created": "21/01/2026",

"lastBookingDate": "31/01/2026"

},

{

"customerID": "Ubhd8A345cPrBBxPH0Q1", "name": "Nguyen van ABC12",

"email": "[2@gmail.com](mailto:2@gmail.com)", "phone": "39849384934",

"idNumber": "129019023920",

"idType": "CMND", "dateOfBirth": "09/12/2025", "address": "ssssssss", "vipStatus": false, "totalBookings": 1,

"totalSpent": 0, "created": "29/11/2025",

"lastBookingDate": "31/01/2026"

}

\]

}

- Đặc tả chi tiết dữ liệu

| Tên trường | Mô tả                                                         |
| ---------- | ------------------------------------------------------------- |
| result     | Mã kết quả gửi về.<br><br>00: Thành công                      |
| message    | Nội dung thống báo nếu có lỗi<br><br>xảy ra.                  |
| data       | Dữ liệu được trả về phía client<br><br>dưới dạng List object. |

# Data

| Tên trường      | Mô tả                                                     |
| --------------- | --------------------------------------------------------- |
| customerID      | Mã khách hàng được tạo trên hệ thống OnePMS.              |
| name            | Tên khách.                                                |
| email           | Email khách.                                              |
| phone           | Số điện thoại khách.                                      |
| idNumber        | Số giấy tờ.                                               |
| idType          | Loại giấy tờ bao gồm: "CMND".<br><br>"Passport". "Other". |
| dateOfBirth     | Ngày sinh của khách                                       |
| address         | Địa chỉ.                                                  |
| vipStatus       | Khách VIP hay không.                                      |
| totalBookings   | Tổng số đặt phòng ở tại khách sạn.                        |
| totalSpent      | Tổng số tiền đã chi tiêu.                                 |
| created         | Ngày tạo thông tin khách.                                 |
| lastBookingDate | Ngày đặt phòng gần nhất (dd/MM/YYYY).                     |

# 13. API cập nhật đặt phòng

| **URL**    | <https://us-central1-neutron-pms.cloudfunctions.net/api-updateBooking> |
| ---------- | ---------------------------------------------------------------------- |
| **Method** | POST                                                                   |

13.1 Header

| **Authentication**  | CryptoJS.AES.encrypt(account, secretKey).toString() |
| ------------------- | --------------------------------------------------- |
| **Content-Type**    | application/json                                    |
| **Accept-Language** | vi - en                                             |

13.2 Body

- Chuỗi json dữ liệu

{

"hotelID": "c9DNrzYtVxog1kDc5X13", "bookingReference": "89VBxiXMe", "arrivalDate": "17/06/2026", "departureDate": "18/06/2026", "bookingNotes": "Khách VIP 10101010", "rooms": \[

{

"bookingID": "1781687378690268",

"roomTypeID": "db", // new RoomTypeID "adult": 2, // new amount

"children": 0 // new amount

},

{

"bookingID": "1781687378690887",

"roomTypeID": "db", // new RoomTypeID "adult": 2, // new amount

"children": 0 // new amount

}

\]

}

- Đặc tả chi tiết dữ liệu

| Tên trường        | Loại dữ liệu      | Mô tả                                         |
| ----------------- | ----------------- | --------------------------------------------- |
| hotelID           | String (Bắt buộc) | Mã khách sạn bạn đã<br><br>lấy được trước đó. |
| bookingRefere nce | String (Bắt buộc) | Mã tham chiếu của đặt phòng.                  |
| arrivalDate       | String            | Ngày nhận phòng cần cập nhật.                 |

| departureDate | String                             | Ngày trả phòng cần cập nhật. |
| ------------- | ---------------------------------- | ---------------------------- |
| bookingNotes  | String                             | Ghi chú cho đặt chỗ          |
| rooms         | List&lt; object&gt;\[\] (Bắt buộc) | Danh sách phòng cần cập nhật |

# Room

| Tên trường | Mô tả               |
| ---------- | ------------------- |
| bookingID  | Mã đặt phòng.       |
| roomTypeID | Mã hạng phòng.      |
| adult      | Số lượng người lớn. |
| children   | Số lượng trẻ em.    |

- **Đầu ra:** Trả về chuỗi kết quả json định dạng

{

"result": "00",

"message": "",

"data": \[\], "totalAmount": 400000

}

- Đặc tả chi tiết dữ liệu

| Tên trường | Mô tả                                        |
| ---------- | -------------------------------------------- |
| result     | Mã kết quả gửi về.<br><br>00: Thành công     |
| message    | Nội dung thống báo nếu có lỗi<br><br>xảy ra. |

| totalAmount | Tổng tiền của đặt chỗ.                                        |
| ----------- | ------------------------------------------------------------- |
| data        | Dữ liệu được trả về phía client<br><br>dưới dạng List object. |

# 14. API thêm thanh toán

| **URL**    | <https://us-central1-neutron-pms.cloudfunctions.net/api-paymentReceived> |
| ---------- | ------------------------------------------------------------------------ |
| **Method** | POST                                                                     |

14.1 Header

| **Authentication**  | CryptoJS.AES.encrypt(account, secretKey).toString() |
| ------------------- | --------------------------------------------------- |
| **Content-Type**    | application/json                                    |
| **Accept-Language** | vi - en                                             |

14.2 Body

- Chuỗi json dữ liệu

{

"hotelID": "c9DNrzYtVxog1kDc5X13", "bookingReference": "T-NT003260", "paymentID": "PAY_891hEhp0e_001", "amount": 110000

"currency": "VND", "paymentMethod": "mo",

"transactionID": "TXN_20260511_001",

}

- Đặc tả chi tiết dữ liệu

| Tên trường | Loại dữ liệu | Mô tả |
| ---------- | ------------ | ----- |

| hotelID           | String (Bắt buộc) | Mã khách sạn bạn đã<br><br>lấy được trước đó. |
| ----------------- | ----------------- | --------------------------------------------- |
| bookingRefere nce | String (Bắt buộc) | Mã tham chiếu của đặt phòng.                  |
| paymentID         | String (Bắt buộc) | Mã thanh toán.                                |
| amount            | String (Bắt buộc) | Sô tiền khách thanh toán.                     |
| currency          | String (Bắt buộc) | Đơn vị tiền tệ                                |
| paymentMetho d    | String (Bắt buộc) | Là mã phương thức thanh toán (ở muc 6)        |
| transactionID     | String            | Mã giao dịch nếu có                           |

- **Đầu ra:** Trả về chuỗi kết quả json định dạng

{

"result": "00",

"message": "",

"data": \[\],

}

- Đặc tả chi tiết dữ liệu

| Tên trường | Mô tả                                        |
| ---------- | -------------------------------------------- |
| result     | Mã kết quả gửi về.<br><br>00: Thành công     |
| message    | Nội dung thống báo nếu có lỗi<br><br>xảy ra. |

| data | Dữ liệu được trả về phía client<br><br>dưới dạng List object. |
| ---- | ------------------------------------------------------------- |

# 15. API cập nhật dịch vụ

| **URL**    | <https://us-central1-neutron-pms.cloudfunctions.net/api-updateService> |
| ---------- | ---------------------------------------------------------------------- |
| **Method** | POST                                                                   |

15.1 Header

| **Authentication**  | CryptoJS.AES.encrypt(account, secretKey).toString() |
| ------------------- | --------------------------------------------------- |
| **Content-Type**    | application/json                                    |
| **Accept-Language** | vi - en                                             |

15.2 Body

- Chuỗi json dữ liệu

{

"hotelID": "c9DNrzYtVxog1kDc5X13", "bookingReference": "T-NT003319", "serviceID": "1781924444087878",

//Cho dv minibar and laundry "items": {

//Cho dv minibar "7PEP3rGqx": {

"amount": 2

},

//Cho dv laundry "aodai": {

"iron": { "amount": 1

},

"laundry": { "amount": 2

}

}

},

//Cho dv phụ minibar "notes": "Vui lòng test lại",

//Cho dv extraGuest "quantity": 1, "serviceType": "child",

//Cho dv bikeRental khi khachs muốn thay đổi loại xe "bike": "90"

}

- Đặc tả chi tiết dữ liệu

| Tên trường        | Loại dữ liệu                                                    | Mô tả                                         |
| ----------------- | --------------------------------------------------------------- | --------------------------------------------- |
| hotelID           | String (Bắt buộc)                                               | Mã khách sạn bạn đã<br><br>lấy được trước đó. |
| serviceID         | String (Bắt buộc)                                               | Mã đặt dịch vụ cầ cập nhật.                   |
| bookingRefere nce | String (Bắt buộc)                                               | Mã tham chiếu của đặt phòng.                  |
| items             | List object. (Bắt buộc) khi cập nhật dịch vụ minibar or laundry | Là dữ liệu cập nhật cho minibar or laundry.   |
| notes             | String (Bắt buộc) khi cập nhật dịch vụ minibar                  | Ghi chú<br><br>Lưu ý: chỉ áp dụng minibar.    |
| quantity          | Number (Bắt buộc)<br><br>khi cập nhật dịch vụ phụ thu khách     | Số lượng khách.                               |
| serviceType       | String (Bắt buộc)<br><br>khi cập nhật dịch vụ phụ thu khách     | Loại khách child/adult.                       |

| bike | String (Bắt buộc)<br><br>khi cập nhật dịch thuê xe | Mã loại xe. |
| ---- | -------------------------------------------------- | ----------- |

- **Đầu ra:** Trả về chuỗi kết quả json định dạng

{

"result": "00",

"message": "",

"data": \[\]

}

- Đặc tả chi tiết dữ liệu

| Tên trường | Mô tả                                                         |
| ---------- | ------------------------------------------------------------- |
| result     | Mã kết quả gửi về.<br><br>00: Thành công                      |
| message    | Nội dung thống báo nếu có lỗi<br><br>xảy ra.                  |
| data       | Dữ liệu được trả về phía client<br><br>dưới dạng List object. |

# 16. API xóa dịch vụ

| **URL**    | <https://us-central1-neutron-pms.cloudfunctions.net/api-deleteService> |     |
| ---------- | ---------------------------------------------------------------------- | --- |
|            |                                                                        |     |
| **Method** | POST                                                                   |     |

16.1 Header

| **Authentication**  | CryptoJS.AES.encrypt(account, secretKey).toString() |
| ------------------- | --------------------------------------------------- |
| **Content-Type**    | application/json                                    |
| **Accept-Language** | vi - en                                             |

16.2 Body

- Chuỗi json dữ liệu

{

"hotelID": "c9DNrzYtVxog1kDc5X13", "bookingReference": "89U4V4ly4", "serviceID": "1781601775466689"

}

- Đặc tả chi tiết dữ liệu

| Tên trường        | Loại dữ liệu      | Mô tả                                         |
| ----------------- | ----------------- | --------------------------------------------- |
| hotelID           | String (Bắt buộc) | Mã khách sạn bạn đã<br><br>lấy được trước đó. |
| serviceID         | String (Bắt buộc) | Mã dịch vụ.                                   |
| bookingRefere nce | String (Bắt buộc) | Mã tham chiếu của đặt phòng.                  |

- **Đầu ra:** Trả về chuỗi kết quả json định dạng

{

"result": "00",

"message": "",

"data": \[\]

}

- Đặc tả chi tiết dữ liệu

| Tên trường | Mô tả                                                         |
| ---------- | ------------------------------------------------------------- |
| result     | Mã kết quả gửi về.<br><br>00: Thành công                      |
| message    | Nội dung thống báo nếu có lỗi<br><br>xảy ra.                  |
| data       | Dữ liệu được trả về phía client<br><br>dưới dạng List object. |

# 17. API nhận phòng

| **URL**    | <https://us-central1-neutron-pms.cloudfunctions.net/api-checkInBooking> |
| ---------- | ----------------------------------------------------------------------- |
| **Method** | POST                                                                    |

17.1 Header

| **Authentication**  | CryptoJS.AES.encrypt(account, secretKey).toString() |
| ------------------- | --------------------------------------------------- |
| **Content-Type**    | application/json                                    |
| **Accept-Language** | vi - en                                             |

17.2 Body

- Chuỗi json dữ liệu

{

"hotelID": "c9DNrzYtVxog1kDc5X13", "bookingIDs": \[

"1781687378690268",

"1781687378690887"

\],

"bookingReference": "89VBxiXMe"

}

- Đặc tả chi tiết dữ liệu

| Tên trường | Loại dữ liệu      | Mô tả                                         |
| ---------- | ----------------- | --------------------------------------------- |
| hotelID    | String (Bắt buộc) | Mã khách sạn bạn đã<br><br>lấy được trước đó. |
| bookingIDs | String (Bắt buộc) | Danh sách mã đặt phòng.                       |

| bookingRefere nce | String (Bắt buộc) | Mã tham chiếu của đặt phòng. |
| ----------------- | ----------------- | ---------------------------- |

- **Đầu ra:** Trả về chuỗi kết quả json định dạng

{

"result": "00",

"message": "",

"data": \[\]

}

- Đặc tả chi tiết dữ liệu

| Tên trường | Mô tả                                                         |
| ---------- | ------------------------------------------------------------- |
| result     | Mã kết quả gửi về.<br><br>00: Thành công                      |
| message    | Nội dung thống báo nếu có lỗi<br><br>xảy ra.                  |
| data       | Dữ liệu được trả về phía client<br><br>dưới dạng List object. |

# 18. API hủy đặt phòng

| **URL**    | [https://us-central1-neutron-pms.cloudfunctions.net/api-](https://us-central1-neutron-pms.cloudfunctions.net/api-addBooking)<br><br>[cancelBooking](https://us-central1-neutron-pms.cloudfunctions.net/api-addBooking) |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Method** | POST                                                                                                                                                                                                                   |

18.1 Header

| **Authentication**  | CryptoJS.AES.encrypt(account, secretKey).toString() |
| ------------------- | --------------------------------------------------- |
| **Content-Type**    | application/json                                    |
| **Accept-Language** | vi - en                                             |

18.2 Body

- Chuỗi json dữ liệu

{

"hotelID": 'Chuỗi id khách sạn', "bookingIDs": \[

"1781687274738377"

\],

"bookingReference": "OAL8PjdK"

}

- Đặc tả chi tiết dữ liệu

| Tên trường        | Loại dữ liệu      | Mô tả                                         |
| ----------------- | ----------------- | --------------------------------------------- |
| hotelID           | String (Bắt buộc) | Mã khách sạn bạn đã<br><br>lấy được trước đó. |
| bookingIDs        | String (Bắt buộc) | Danh sách mã đặt phòng.                       |
| bookingRefere nce | String (Bắt buộc) | Mã tham chiếu của đặt phòng.                  |

- **Đầu ra:** Trả về chuỗi kết quả json định dạng

{

"result": "00",

"message": "",

"data": \[\]

}

- Đặc tả chi tiết dữ liệu

| Tên trường | Mô tả                                    |
| ---------- | ---------------------------------------- |
| result     | Mã kết quả gửi về.<br><br>00: Thành công |
| message    | Nội dung thống báo nếu có lỗi            |

|      | xảy ra.                                                       |
| ---- | ------------------------------------------------------------- |
| data | Dữ liệu được trả về phía client<br><br>dưới dạng List object. |

# 19. Bảng mã lỗi

| **Mã lỗi** | **Nội dung**                                    | **Xử lý**                                                                      |
| ---------- | ----------------------------------------------- | ------------------------------------------------------------------------------ |
| 001        | Xác thực tài khoản thất bại                     | Kiểm tra lại thông tin Authentication và truyền lại thông tin.                 |
| 002        | Tài khoản không tồn tại                         | Kiểm tra lại tài khoản đã được đăng ký trên hệ thống OnePMS.                   |
| 003        | Tài khoản chưa được phân quyền                  | Kiểm tra lại tài khoản được phân quyền để gọi API trên hệ thống<br><br>OnePMS. |
| 004        | Hạng phòng này đã bị xóa trên PMS               | Kiểm tra lại tình thái hạng phòng trên OnePMS sau đó gọi lại.                  |
| 005        | ID khách sạn không được<br><br>để trống         | Hãy truyền thêm HotelID khi gọi API                                            |
| 006        | Không tìm thấy khách<br><br>sạn                 | Kiểm tra lại HotelID có đúng.                                                  |
| 007        | Có sự chệch lệch giữa ngày và giá của đặt phòng | Kiểm tra lại danh sách đơn giá và ngày ở của đặt phòng.                        |
| 008        | Hạng phòng này không<br><br>tồn tại             | Kiểm tra mã hạng phòng trên hệ thống<br><br>OnePMS có tồn tại không.           |
| 009        | Đặt phòng này không tồn tại                     | Kiểm tra lại mã đặt phòng có tồn tại trên hệ thống OnePMS không.               |

| 010 | Đặt phòng đang có giảm giá                | Kiểm tra tình huống đặt phòng này được phép hủy hệ thống OnePMS không, nếu được phép thì xóa giảm<br><br>giá sau đó thử lại.                |
| --- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| 011 | Đặt phòng đang có thanh toán hoặc dịch vụ | Kiểm tra tình huống đặt phòng này được phép hủy hệ thống OnePMS không, nếu được phép thì xóa thanh<br><br>toán hoặc dịch vụ sau đó thử lại. |
| 012 | Đặt phòng này không ở trạng thái đặt      | Kiểm tra tình huống đặt phòng này có đang ở trạng thái đặt không.                                                                           |
| 013 | Đặt phòng đang có thuê xe máy             | Kiểm tra tình huống đặt phòng này được phép hủy hệ thống OnePMS không, nếu được phép thì xóa thuê xe máy sau đó thử lại.                    |
| 014 | Đặt phòng đang có tiền cọc                | Kiểm tra tình huống đặt phòng này được phép hủy hệ thống OnePMS không, nếu được phép thì xóa hoặc trả<br><br>cọc sau đó thử lại.            |
| 015 | Đặt phòng này đã hủy hoặc trả phòng       | Trường hợp này có thể kiểm tra trạng thái đặt phòng hoặc bỏ qua.                                                                            |
| 016 | Phương thức thanh toán không để trống     | Kiểm tra lại mã phương thức thanh toán và thử lại.                                                                                          |
| 017 | Hạng phòng không tồn tại                  | Kiểm tra lại hạng phòng dưới PMS có tồn tại hay không.                                                                                      |
| 019 | Không phải ngày nhận phòng hôm nay        | Kiểm tra lại ngày nhận phòng có đúng ngay hôm nay không.                                                                                    |
| 020 | Đã nhận phòng                             | Trường hợp này có thể kiểm tra trạng<br><br>thái đặt phòng hoặc bỏ qua.                                                                     |
| 021 | Đặt phòng không ở trạng thái Booked       | Trường hợp này cần kiểm tra trạng thái đặt phòng.                                                                                           |
| 022 | Phòng đã bị xóa                           | Kiểm tra lại phòng của đặt phòng dưới PMS có phòng không.                                                                                   |

| 023 | Không tìm thấy phòng                             | Kiểm tra lại phòng dưới PMS có tồn tại hay không.                                   |
| --- | ------------------------------------------------ | ----------------------------------------------------------------------------------- |
| 024 | Phòng vẫn chưa trả phòng                         | Kiểm tra lại phòng của đặt phòng dưới<br><br>PMS có được trả phòng chưa và thử lại. |
| 025 | Không tìm thấy dịch vụ                           | Kiểm tra lại dich vụ của đặt phòng dưới PMS có tồn tại hay không.                   |
| 026 | Khoảng thời gian lọc không được vượt quá 30 ngày |                                                                                     |