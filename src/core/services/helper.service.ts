import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
const Crypt = require('cryptr');

import { ConfigService } from '@nestjs/config';
import slugify from 'slugify';
import { PermissionService } from './permission.service';
const cryptoJS = require('crypto-js');
const moment = require('moment');
import { exec } from 'shelljs';
var crypto = require('crypto');
const fs = require('fs');

@Injectable()
export class HelperService {
   private crypt: any;
   private secretKeyApi: string;

   constructor(private configService: ConfigService) {
      this.crypt = new Crypt('DSAV65345GDVFBGR7657BFDBFD&%#%$2');
      this.secretKeyApi = process.env.SECRET_KEY_API;
   }

   async execCommand(command: string): Promise<any> {
      return new Promise((resolve, reject) => {
         exec(command, (error) => {
            if (error) {
               console.log('lỗi');
               reject(error);
            }
            resolve(true);
         });
      });
   }

   async encodeHMACSHA256() {
      const secretKey = fs.readFileSync('storage/data/hmacsha256.key', 'utf8');
      const hmac = crypto.createHmac('SHA256', secretKey);
      hmac.update('anhladaubep');
      const encryptedData = hmac.digest('base64');
      return encryptedData;
   }

   encryptResToServer(data: any) {
      const PRIVATE_SECRET_KEY = '6w9z$C&F)J@NcRfTjWnZr4u7x!A%D*G-';
      const encKey = new Date().getTime();
      return {
         data: cryptoJS.AES.encrypt(JSON.stringify(data), `${PRIVATE_SECRET_KEY}${encKey}`).toString(),
         encKey,
      };
   }

   decryptRes(encryptedData: any) {
      const PRIVATE_SECRET_KEY = '6w9z$C&F)J@NcRfTjWnZr4u7x!A%D*G-';
      const decryptedBytes = cryptoJS.AES.decrypt(encryptedData, PRIVATE_SECRET_KEY);
      const decryptedText = decryptedBytes.toString(cryptoJS.enc.Utf8);

      console.log(decryptedText);
   }

   async VerifyHMACSHA256(data: any, signedData: string) {
      const secretKey = fs.readFileSync('storage/data/hmacsha256.key', 'utf8');
      const hmac = crypto.createHmac('SHA256', secretKey);
      hmac.update(data);
      const calculatedHmac = hmac.digest('base64');

      // Compare calculated HMAC with received HMAC
      const isVerified = signedData === calculatedHmac;

      return isVerified;
   }

   encryptRes(request, data: object, timestamp: string) {
      // encrypt api game client only
      if (typeof data['docs'] != 'undefined') {
         return {
            list: data['docs'],
            ...data,
            docs: undefined,
         };
      }
      return data;
      const prefixPath = process.env.BASE_PATH ? `${process.env.BASE_PATH}/api/v1` : 'api/v1';
      const regex = new RegExp(
         `${prefixPath}\/socket-server` +
            '|' +
            `${prefixPath}\/game\/game-pvp` +
            '|' +
            `${prefixPath}\/admin` +
            '|' +
            `${prefixPath}\/auth\/users\/login` +
            '|' +
            `${prefixPath}\/auth\/users\/logout` +
            '|' +
            `${prefixPath}\/auth\/users\/profile`,
         'gm',
      );

      let matches = request.route.path.match(regex);
      // matches = true;
      // No encrypt data if exist header noEncrypt on env not equal production
      if (request.header('noEncrypt') && process.env.NODE_ENV != 'production') matches = true;

      // cms | socket pagination
      if (typeof data['docs'] != 'undefined') {
         data = {
            list: data['docs'],
            ...data,
            docs: undefined,
         };
      }
      // cms | socket object
      if (matches) return data;

      // encrypt data
      return {
         data: cryptoJS.AES.encrypt(JSON.stringify(data), `${this.secretKeyApi}${timestamp}`).toString(),
         encKey: timestamp,
      };
   }

   allPermissions(): Record<any, any> {
      return PermissionService.permissions.allow;
   }

   throwException(message?: string, statusCode?: number): HttpException {
      throw new HttpException(
         {
            status: false,
            statusCode: statusCode || HttpStatus.NOT_FOUND,
            message: message || 'Unknown Error',
         },
         statusCode || HttpStatus.NOT_FOUND,
      );
   }

   addDateTime(addition: string, unit: string, format?: string, datetime?: string): string {
      unit = unit || 'h';
      format = format || 'DD-MM-YYYY HH:mm:ss';
      datetime = datetime || moment().format(format);
      return moment(datetime).add(addition, unit).format(format);
   }

   async compareHash(plaintext: string, hash: string): Promise<boolean> {
      return await bcrypt.compare(plaintext, hash);
   }

   async hash(plaintext: string, hash = 2): Promise<string> {
      return bcrypt.hash(plaintext, hash);
   }

   /**
    * Encrypt a text
    * @param text
    */
   encryptText(text: string): string {
      return this.crypt.encrypt(text);
   }

   /**
    * Decrypt a text
    * @param text
    */
   decryptText(text: string): string {
      return this.crypt.decrypt(text);
   }

   /**
    * Slug a text
    * @param text
    */
   slug(text: string): string {
      return slugify(text, {
         lower: true,
      });
   }

   nonAccentVietnamese(str = '') {
      str = str.toLowerCase();

      //     We can also use this instead of from line 11 to line 17
      //     str = str.replace(/\u00E0|\u00E1|\u1EA1|\u1EA3|\u00E3|\u00E2|\u1EA7|\u1EA5|\u1EAD|\u1EA9|\u1EAB|\u0103|\u1EB1|\u1EAF|\u1EB7|\u1EB3|\u1EB5/g, "a");
      //     str = str.replace(/\u00E8|\u00E9|\u1EB9|\u1EBB|\u1EBD|\u00EA|\u1EC1|\u1EBF|\u1EC7|\u1EC3|\u1EC5/g, "e");
      //     str = str.replace(/\u00EC|\u00ED|\u1ECB|\u1EC9|\u0129/g, "i");
      //     str = str.replace(/\u00F2|\u00F3|\u1ECD|\u1ECF|\u00F5|\u00F4|\u1ED3|\u1ED1|\u1ED9|\u1ED5|\u1ED7|\u01A1|\u1EDD|\u1EDB|\u1EE3|\u1EDF|\u1EE1/g, "o");
      //     str = str.replace(/\u00F9|\u00FA|\u1EE5|\u1EE7|\u0169|\u01B0|\u1EEB|\u1EE9|\u1EF1|\u1EED|\u1EEF/g, "u");
      //     str = str.replace(/\u1EF3|\u00FD|\u1EF5|\u1EF7|\u1EF9/g, "y");
      //     str = str.replace(/\u0111/g, "d");
      str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
      str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
      str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
      str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
      str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
      str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
      str = str.replace(/đ/g, 'd');
      // Some system encode vietnamese combining accent as individual utf-8 characters
      str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ''); // Huyền sắc hỏi ngã nặng
      str = str.replace(/\u02C6|\u0306|\u031B/g, ''); // Â, Ê, Ă, Ơ, Ư
      return str;
   }

   removeSignVietnamese(str = '') {
      str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
      str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
      str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
      str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
      str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
      str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
      str = str.replace(/đ/g, 'd');
      // Some system encode vietnamese combining accent as individual utf-8 characters
      str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ''); // Huyền sắc hỏi ngã nặng
      str = str.replace(/\u02C6|\u0306|\u031B/g, ''); // Â, Ê, Ă, Ơ, Ư
      return str;
   }

   translateZoneNameVietnamese(str = '', zoneType = 1) {
      if (zoneType == 1) {
         if (str.indexOf('Thành Phố') == 0) {
            str = str.replace('Thành Phố', '');
            str = `${str} City`;
         }
      } else if (zoneType == 2) {
         if (str.indexOf('Quận') == 0) {
            str = str.replace('Quận', '');
            if (!isNaN(parseInt(str))) {
               str = `District${str} `;
            } else {
               str = `${str} District`;
            }
         } else if (str.indexOf('Huyện') == 0) {
            str = str.replace('Huyện', '');
            str = `${str} Town`;
         } else if (str.indexOf('Thị Xã') == 0) {
            str = str.replace('Thị Xã', '');
            str = `${str} Town`;
         } else if (str.indexOf('Thành Phố') == 0) {
            str = str.replace('Thành Phố', '');
            str = `${str} City`;
         }
      } else if (zoneType == 3) {
         if (str.indexOf('Phường') == 0) {
            str = str.replace('Phường', '');
            str = `${str} Ward`;
         } else if (str.indexOf('Xã') == 0) {
            str = str.replace('Xã', '');
            str = `${str} Commune`;
         } else if (str.indexOf('Thị Trấn') == 0) {
            str = str.replace('Thị Trấn', '');
            str = `${str} Town`;
         }
      }

      str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
      str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
      str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
      str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
      str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
      str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
      str = str.replace(/đ/g, 'd');
      // Some system encode vietnamese combining accent as individual utf-8 characters
      str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ''); // Huyền sắc hỏi ngã nặng
      str = str.replace(/\u02C6|\u0306|\u031B/g, ''); // Â, Ê, Ă, Ơ, Ư

      return str;
   }

   removeSignVietnameseSlug(vi = '') {
      vi = vi.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
      vi = vi.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
      vi = vi.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
      vi = vi.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
      vi = vi.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
      vi = vi.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
      vi = vi.replace(/đ/g, 'd');
      // Some system encode vietnamese combining accent as individual utf-8 characters
      vi = vi.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ''); // Huyền sắc hỏi ngã nặng
      vi = vi.replace(/\u02C6|\u0306|\u031B/g, ''); // Â, Ê, Ă, Ơ, Ư

      vi = vi.replace(/^\s+|\s+$/g, '');
      vi = vi.replace(/\ +/g, '-');
      vi = vi.toLowerCase();
      return vi;
   }

   filterKeys(object: object, keys: Array<string> = [], allowed = true): object {
      keys = [...keys, 'page', 'limit', 'get'];
      if (keys.length > 0) {
         Object.keys(object).forEach(function (key) {
            if (keys.indexOf(key) == -1 && allowed === true) {
               delete object[key];
            } else if (keys.indexOf(key) != -1 && allowed === false) {
               delete object[key];
            }
         });
      }
      return object;
   }

   encryptKey(data: string) {
      const PRIVATE_SECRET_KEY = '6w9z$C&F)J@NcRfTjWnZr4u7x!A%D*G-';
      return cryptoJS.AES.encrypt(data, `${PRIVATE_SECRET_KEY}`).toString();
   }

   decryptKey(encryptedData: any) {
      const PRIVATE_SECRET_KEY = '6w9z$C&F)J@NcRfTjWnZr4u7x!A%D*G-';
      const decryptedBytes = cryptoJS.AES.decrypt(encryptedData, PRIVATE_SECRET_KEY);
      const decryptedText = decryptedBytes.toString(cryptoJS.enc.Utf8);
      return decryptedText;
   }

   isSameDay(d1, d2) {
      return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
   }

   getRoleConfig(roleType: string) {
      const config = {
         silver: { dailyClicks: 7, durationDays: 7 },
         gold: { dailyClicks: 10, durationDays: 15 },
         diamond: { dailyClicks: 15, durationDays: 30 },
      };
      return config[roleType];
   }
}
