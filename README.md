# Eng
# Blockless Bless Network Bot 

## Description
This script automates network or node operations for Blockless Bless Network Bot.

![Screenshot Bless Bot](https://github.com/Iray-21/Bless-bot/blob/main/Screenshot.jpg?raw=true)

## Update

- if you already generated pubkey using sc before just retire it
- must generate pubkey manually at extension bless network
- hardwareId is can generate from sc, or just paste from extension bless network
- input manually `id.txt` with your pubkey and hardwareid

## Features
- **Automated node interaction**
- **Multiple Accounts**
- **Multi NodeID**
- **Proxy support**

## Prerequisites
- [Node.js](https://nodejs.org/)

## Installation

1. Clone the repository to your local machine:
   ```bash
   git clone https://github.com/Iray-21/Bless-bot.git
   ```
2. Navigate to the project directory:
	```bash
	cd Bless-bot
	```
3. Install the necessary dependencies:
	```bash
	npm install
	```

## Usage
1. Register to blockless bless network account first, if you dont have you can register [https://bless.network/](https://bless.network/dashboard?ref=CQM884).
2. Set and Modify `user.txt`. Below how to setup this file, put your B7S_AUTH_TOKEN in the text file, example below:
	```
	eyJhbGcixxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
	```
	To get your token, follow this step:
	- Login to your blockless account in [https://bless.network/](https://bless.network/dashboard?ref=CQM884), 
	- Go to inspect element, press F12 or right-click then pick inspect element in your browser
	- Go to application tab - look for Local Storage in storage list -> click `https://bless.network` and you will see your B7S_AUTH_TOKEN.
	- or you can go Console tab and paste this 
	```bash
	localStorage.getItem('B7S_AUTH_TOKEN')
	```
3. Create hardware id
- you can automatically create it with this command
    ```
    node setup.js
    ```
	put in `id.txt`. in the text file with this format `nodeid(pubkey):hardwareid`, example below:
	```
 	12D3Koxxxxxxxxxxxx3ws:e938610xxxxxxxxxxxx
	12D3Koxxxxxxxxxxxx58o:221610xxxxxxxxxxxxx
 	```
4. put your pubkey you get from extension
	```bash
	nano id.txt
	```

5. If you want to use `proxy`, edit `proxy.txt` and add your proxy in there. Make sure total proxy is same with your total `nodeid(pubkey):hardwareid` that you put in `id.txt` 
6. Run the script:
	```bash
	node main.js
	```
**NOTE:
The total time is refreshed every 10 minutes connection, One account only can have 5 nodeid max/account and can't be deleted, I recomended to save your Nodeid(pubkey) and hardwareid of your account**

**How to Access Multiple Accounts?**
- Mandatory 1 user must have 5 nodes/pubkeys.
- just add tokens for other account in user.txt
and add 5 pubkeys other account in id.txt again.

**How to Get the Pubkey?**  
Here, I’m using Kiwi Browser:  
1. I’m on the BlessNetwork dashboard.  
2. Then, open the developer tools in Kiwi Browser.  
3. After that, refresh the BlessNetwork dashboard.  
4. Go back to the developer tools, select the **NETWORK** option.  
5. Look for something like this:  

![Screenshot Bless Bot](https://github.com/Iray-21/Bless-bot/blob/main/Screenshot2.jpg?raw=true)

6. Then, copy the required information.

**How to get 5 nodes/pubkey for one accounts?**
Just logout and delete extension then install extension again and login again.
do this until you have 5 pubkeys for one account

# Example
i'm running 6 accounts
![Screenshot user Bless Bot](https://github.com/Iray-21/Bless-bot/blob/main/user.jpg?raw=true)

then i have to input 30 nodes like this in id.txt
![Screenshot id Bless Bot](https://github.com/Iray-21/Bless-bot/blob/main/id.jpg?raw=true)


# Id
# Blockless Bless Network Bot

## Deskripsi
Skrip ini mengotomatiskan operasi jaringan atau node untuk Blockless Bless Network Bot.

![Screenshot Bless Bot](https://github.com/Iray-21/Bless-bot/blob/main/Screenshot.jpg?raw=true)

## Pembaruan

- Jika Anda sudah menghasilkan pubkey menggunakan `sc` sebelumnya, cukup pensiunkan saja.
- Harus menghasilkan pubkey secara manual di ekstensi Bless Network.
- `hardwareId` dapat dihasilkan dari `sc`, atau cukup salin dari ekstensi Bless Network.
- Masukkan secara manual `id.txt` dengan pubkey dan hardwareid Anda.

## Fitur
- **Interaksi node otomatis**
- **Multi Akun**
- **Multi NodeID**
- **Dukungan proxy**

## Prasyarat
- [Node.js](https://nodejs.org/)

## Instalasi

1. Clone repositori ke mesin lokal Anda:
   ```bash
   git clone https://github.com/Iray-21/Bless-bot.git
   ```
2. Masuk ke direktori proyek:
	```bash
	cd Bless-bot
	```
3. Instal dependensi yang diperlukan:
	```bash
	npm install
	```

## Penggunaan
1. Daftar ke akun Blockless Bless Network terlebih dahulu, jika Anda belum memilikinya, Anda dapat mendaftar di [https://bless.network/](https://bless.network/dashboard?ref=CQM884).
2. Atur dan Modifikasi `user.txt`. Berikut cara mengatur file ini, masukkan `B7S_AUTH_TOKEN` Anda ke dalam file teks, contoh di bawah ini:
	```
	eyJhbGcixxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
	```
	Untuk mendapatkan token Anda, ikuti langkah berikut:
	- Login ke akun Blockless Anda di [https://bless.network/](https://bless.network/dashboard?ref=CQM884),
	- Buka inspect element, tekan F12 atau klik kanan lalu pilih inspect element di browser Anda.
	- Buka tab Application - cari Local Storage di daftar penyimpanan -> klik `https://bless.network` dan Anda akan melihat `B7S_AUTH_TOKEN` Anda.
	- atau Anda bisa pergi ke tab Console dan tempelkan ini:
	```bash
	localStorage.getItem('B7S_AUTH_TOKEN')
	```
3. Buat hardware id
- Anda dapat membuatnya secara otomatis dengan perintah ini:
    ```
    node setup.js
    ```
	Masukkan ke dalam `id.txt`. Dalam file teks dengan format `nodeid(pubkey):hardwareid`, contoh di bawah ini:
	```
 	12D3Koxxxxxxxxxxxx3ws:e938610xxxxxxxxxxxx
	12D3Koxxxxxxxxxxxx58o:221610xxxxxxxxxxxxx
 	```
4. Masukkan pubkey yang Anda dapatkan dari ekstensi:
	```bash
	nano id.txt
	```

5. Jika Anda ingin menggunakan `proxy`, edit `proxy.txt` dan tambahkan proxy Anda di sana. Pastikan total proxy sama dengan total `nodeid(pubkey):hardwareid` yang Anda masukkan di `id.txt`.
6. Jalankan skrip:
	```bash
	node main.js
	```
**CATATAN:
Total waktu diperbarui setiap 10 menit koneksi, Satu akun hanya dapat memiliki maksimal 5 nodeid/akun dan tidak dapat dihapus, Saya merekomendasikan untuk menyimpan Nodeid(pubkey) dan hardwareid akun Anda**


**Bagaimana Cara Mengakses Multi Akun?**
- Wajib 1 pengguna harus memiliki 5 node/pubkey.
- cukup tambahkan token untuk akun lain di `user.txt`
dan tambahkan 5 pubkey akun lain di `id.txt` lagi.

**Bagaimana Cara Mendapatkan Pubkey?**
Di sini saya menggunakan Kiwi Browser:
1. Saya berada di dashboard BlessNetwork.
2. Kemudian, buka menu developer tools di Kiwi Browser.
3. Setelah itu, refresh dashboard BlessNetwork.
4. Kembali ke developer tools, pilih opsi **NETWORK**.
5. Cari yang seperti ini:

![Screenshot Bless Bot](https://github.com/Iray-21/Bless-bot/blob/main/Screenshot2.jpg?raw=true)

6. Lalu, salin (copy).

**Bagaimana Cara Mendapatkan 5 node/pubkey untuk satu akun?**
Cukup logout dan hapus ekstensi lalu instal ekstensi lagi lalu login lagi.
Lakukan ini sampai Anda memiliki 5 pubkey untuk satu akun.

# Contoh
Saya menjalankan 6 akun
![Screenshot user Bless Bot](https://github.com/Iray-21/Bless-bot/blob/main/user.jpg?raw=true)

maka saya harus memasukkan 30 node seperti ini di `id.txt`
![Screenshot id Bless Bot](https://github.com/Iray-21/Bless-bot/blob/main/id.jpg?raw=true)

