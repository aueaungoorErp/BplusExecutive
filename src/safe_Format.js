import { Alert, InteractionManager, Platform } from 'react-native';
let years = [];
var daily = new Date();
let yearIndex = daily.getFullYear() + 543;
export const months_th = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
export const months_th_mini = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
for (var i = yearIndex - 100; i <= yearIndex + 100; i++) {
  years.push(i);
}
export const state_years = years;
const buildMonthDayNumbers = (yearBe, monthIndex) => {
  const y = Number(yearBe) - 543;
  const m = Number(monthIndex);
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const days = [];
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }
  return days;
};
export const Day_Calendar = (year, mont) => {
  const y = Number(year) - 543;
  const m = Number(mont);
  const firstDow = new Date(y, m, 1).getDay();
  const days = buildMonthDayNumbers(year, mont);
  let obj = [];
  const dayObj = [];
  for (let i = 0; i < firstDow; i++) {
    obj.push('');
  }
  days.forEach(item => {
    obj.push(item);
    if (obj.length === 7) {
      dayObj.push(obj);
      obj = [];
    }
  });
  if (obj.length > 0) {
    while (obj.length < 7) {
      obj.push('');
    }
    dayObj.push(obj);
  }
  return dayObj;
};
export const Day_mont = (year, mont) => {
  return buildMonthDayNumbers(year, mont);
};
export const regisMacAdd = async (urlser, serviceID, machineNum, userNameED, passwordED) => {
  await fetch(urlser + '/DevUsers', {
    method: 'POST',
    body: JSON.stringify({
      'BPAPUS-BPAPSV': serviceID,
      'BPAPUS-LOGIN-GUID': '',
      'BPAPUS-FUNCTION': 'Register',
      'BPAPUS-PARAM': '{"BPAPUS-MACHINE":"' + machineNum + '","BPAPUS-CNTRY-CODE": "66","BPAPUS-MOBILE": "mobile login"}'
    })
  }).then(response => response.json()).then(async json => {
    if (json.ResponseCode == 200 && json.ReasonString == 'Completed') {
      return await _fetchGuidLog(urlser, serviceID, machineNum, userNameED, passwordED);
    } else {}
  }).catch(error => {});
};
export const _fetchGuidLog = async (urlser, serviceID, machineNum, userNameED, passwordED) => {
  var new_GUID = '';
  await fetch(urlser + '/DevUsers', {
    method: 'POST',
    body: JSON.stringify({
      'BPAPUS-BPAPSV': serviceID,
      'BPAPUS-LOGIN-GUID': '',
      'BPAPUS-FUNCTION': 'Login',
      'BPAPUS-PARAM': '{"BPAPUS-MACHINE": "' + machineNum + '","BPAPUS-USERID": "' + userNameED + '","BPAPUS-PASSWORD": "' + passwordED + '"}'
    })
  }).then(response => response.json()).then(json => {
    if (json && json.ResponseCode == '200') {
      let responseData = JSON.parse(json.ResponseData);
      new_GUID = responseData.BPAPUS_GUID;
    } else {}
  }).catch(error => {
    console.error('ERROR at _fetchGuidLogin' + error);
  });
  return new_GUID;
};
export const monthFormat = month => {
  return months_th[Number(month) - 1];
};
export const massageFormat = text => {
  if (text.length > 0) return text;else return '-';
};
export const currencyFormat = num => {
  if (num == 0) return '-';else return Number(num).toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
};
export const sumTabledata = item => {
  var sumItem = 0;
  for (var i in item) {
    sumItem += Number(item[i]);
  }
  return sumItem;
};
export const dateFormat = date => {
  var x = new Date();
  var year = x.getFullYear();
  var inputyear = Number(date.substring(0, 4));
  if (inputyear <= Number(x.getFullYear())) inputyear += 543;
  return date.substring(6, 8) + '/' + months_th_mini[Number(date.substring(4, 6)) - 1] + '/' + inputyear;
};
export const checkDate = temp_date => {
  if (temp_date == null) {
    return new Date();
  }
  if (temp_date instanceof Date) {
    if (Number.isNaN(temp_date.getTime())) {
      return new Date();
    }
    // th-datepicker (era=be) may return a Date whose year is Buddhist Era
    const beYear = temp_date.getFullYear();
    if (beYear > 2400) {
      return new Date(beYear - 543, temp_date.getMonth(), temp_date.getDate(), temp_date.getHours(), temp_date.getMinutes(), temp_date.getSeconds(), temp_date.getMilliseconds());
    }
    return temp_date;
  }
  const str = String(temp_date).trim();
  if (!str) {
    return new Date();
  }
  if (str.includes('/')) {
    const parts = str.split('/').map(part => part.trim());
    if (parts.length >= 3) {
      let day = Number(parts[0]);
      let month = Number(parts[1]) - 1;
      let year = Number(parts[2]);
      if (year > 2400) {
        year -= 543;
      }
      const parsed = new Date(year, month, day);
      if (!Number.isNaN(parsed.getTime())) {
        return parsed;
      }
    }
  }
  if (str.includes('-')) {
    const parts = str.split('-').map(part => part.trim());
    if (parts.length >= 3) {
      let year = Number(parts[0]);
      let month = Number(parts[1]) - 1;
      let day = Number(parts[2]);
      if (year <= 100 || parts[0].length <= 2) {
        day = Number(parts[0]);
        month = Number(parts[1]) - 1;
        year = Number(parts[2]);
      }
      if (year > 2400) {
        year -= 543;
      }
      const parsed = new Date(year, month, day);
      if (!Number.isNaN(parsed.getTime())) {
        return parsed;
      }
    }
  }
  const fallback = new Date(temp_date);
  return Number.isNaN(fallback.getTime()) ? new Date() : fallback;
};
export const setnewdateF = date => {
  var x = new Date(date);
  var day = x.getDate();
  if (day < 10) day = '0' + day.toString();
  var month = x.getMonth() + 1;
  if (month < 10) month = '0' + month.toString();
  var year = x.getFullYear();
  return year + '' + month + '' + day;
};
export const gettoDate = () => {
  var x = new Date();
  return setnewdateF(x);
};
export const Radio_menu = (index, val) => {
  var x = new Date();
  var day = x.getDate();
  var month = x.getMonth() + 1;
  var year = x.getFullYear();
  var sdate = '';
  var edate = '';
  if (val == 'lastyear') {
    year = year - 1;
    sdate = new Date(year, 0, 1);
    edate = new Date(year, 12, 0);
  } else if (val == 'lastAyear') {
    year = year - 1;
    sdate = new Date(year, 12, 0);
    edate = new Date(year, 12, 0);
  } else if (val == 'nowyear') {
    year = year;
    sdate = new Date(year, 0, 1);
    edate = new Date(year, 12, 0);
  } else if (val == 'nowmonth') {
    month = month - 1;
    sdate = new Date(year, month, 1);
    edate = new Date(year, month + 1, 0);
  } else if (val == 'lastmonth') {
    month = month - 2;
    sdate = new Date(year, month, 1);
    edate = new Date(year, month + 1, 0);
  } else if (val == 'lastAmonth') {
    month = month - 2;
    sdate = new Date(year, month + 1, 0);
    edate = new Date(year, month + 1, 0);
  } else if (val == 'lastday') {
    sdate = new Date().setDate(x.getDate() - 1);
    edate = new Date().setDate(x.getDate() - 1);
  } else {
    sdate = new Date();
    edate = new Date();
  }
  return {
    index: index,
    sdate: new Date(sdate),
    edate: new Date(edate)
  };
};
export const Base64 = {
  // private property
  _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
  // public method for encoding
  encode: function (input) {
    var output = "";
    var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
    var i = 0;
    input = Base64._utf8_encode(input);
    while (i < input.length) {
      chr1 = input.charCodeAt(i++);
      chr2 = input.charCodeAt(i++);
      chr3 = input.charCodeAt(i++);
      enc1 = chr1 >> 2;
      enc2 = (chr1 & 3) << 4 | chr2 >> 4;
      enc3 = (chr2 & 15) << 2 | chr3 >> 6;
      enc4 = chr3 & 63;
      if (isNaN(chr2)) {
        enc3 = enc4 = 64;
      } else if (isNaN(chr3)) {
        enc4 = 64;
      }
      output = output + Base64._keyStr.charAt(enc1) + Base64._keyStr.charAt(enc2) + Base64._keyStr.charAt(enc3) + Base64._keyStr.charAt(enc4);
    }
    return output;
  },
  // public method for decoding
  decode: function (input) {
    var output = "";
    var chr1, chr2, chr3;
    var enc1, enc2, enc3, enc4;
    var i = 0;
    input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
    while (i < input.length) {
      enc1 = Base64._keyStr.indexOf(input.charAt(i++));
      enc2 = Base64._keyStr.indexOf(input.charAt(i++));
      enc3 = Base64._keyStr.indexOf(input.charAt(i++));
      enc4 = Base64._keyStr.indexOf(input.charAt(i++));
      chr1 = enc1 << 2 | enc2 >> 4;
      chr2 = (enc2 & 15) << 4 | enc3 >> 2;
      chr3 = (enc3 & 3) << 6 | enc4;
      output = output + String.fromCharCode(chr1);
      if (enc3 != 64) {
        output = output + String.fromCharCode(chr2);
      }
      if (enc4 != 64) {
        output = output + String.fromCharCode(chr3);
      }
    }
    output = Base64._utf8_decode(output);
    return output;
  },
  // private method for UTF-8 encoding
  _utf8_encode: function (string) {
    string = string.replace(/\r\n/g, "\n");
    var utftext = "";
    for (var n = 0; n < string.length; n++) {
      var c = string.charCodeAt(n);
      if (c < 128) {
        utftext += String.fromCharCode(c);
      } else if (c > 127 && c < 2048) {
        utftext += String.fromCharCode(c >> 6 | 192);
        utftext += String.fromCharCode(c & 63 | 128);
      } else {
        utftext += String.fromCharCode(c >> 12 | 224);
        utftext += String.fromCharCode(c >> 6 & 63 | 128);
        utftext += String.fromCharCode(c & 63 | 128);
      }
    }
    return utftext;
  },
  // private method for UTF-8 decoding
  _utf8_decode: function (utftext) {
    var string = "";
    var i = 0;
    var c = c1 = c2 = 0;
    while (i < utftext.length) {
      c = utftext.charCodeAt(i);
      if (c < 128) {
        string += String.fromCharCode(c);
        i++;
      } else if (c > 191 && c < 224) {
        c2 = utftext.charCodeAt(i + 1);
        string += String.fromCharCode((c & 31) << 6 | c2 & 63);
        i += 2;
      } else {
        c2 = utftext.charCodeAt(i + 1);
        c3 = utftext.charCodeAt(i + 2);
        string += String.fromCharCode((c & 15) << 12 | (c2 & 63) << 6 | c3 & 63);
        i += 3;
      }
    }
    return string;
  }
};

/** iOS: รอ modal/loading ปิดก่อน ไม่งั้น Alert ไม่ขึ้น */
export const alertNoData = (message = 'ไม่พบข้อมูล') => {
  const show = () => Alert.alert(message);
  if (Platform.OS === 'ios') {
    InteractionManager.runAfterInteractions(() => {
      setTimeout(show, 350);
    });
  } else {
    show();
  }
};