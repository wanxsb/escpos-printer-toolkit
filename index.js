const BufferHelper  = require("./buffer-helper");
// const fs = require('fs');
// const Jimp = require("jimp");
// const request = require('request');
const iconv = require("iconv-lite");
// const Deasync = require("deasync");
const Buffer = require('buffer').Buffer

var exchange_text_with_times = exports.exchange_text_with_times = function exchange_text_with_times(text, times, options){
    times = (times === undefined ? 1 : times);
    var bytes = new BufferHelper();
    var text_buffer = exchange_text(text, options)
    for(var i=0;i<times;i++){
        bytes.concat(text_buffer);
    }
    return bytes.toBuffer()
}

var exchange_text = exports.exchange_text = function exchange_text(text, options){
    options = options || {
        beep: false,
        cut: true,
        tailingLine: true,
        encoding: 'UTF8',
    }
    // 初始化打印机
    var init_printer_bytes = new Buffer([27, 64]);
    // 读取设备状态
    var check_state_bytes = new Buffer([29, 153]);
    // 返回字符 1D 99 XX FF
    // 其中XX的每位表示的意义
    // 0  0:有纸 1:缺纸
    // 1  0:合盖 1:开盖
    // 2  0:温度正常 1:机芯过热
    // 3  0:电量正常 1:电量低
    // 4  0:未打印状态 1:打印状态
    // 5  未定义
    // 6  未定义
    // 7  未定义

    // 正常打印模式
    var init_bytes = new Buffer([27, 33, 0]);
    // 放大字体
    //<M></M>      中号字体（2倍高）
    //<D></D>      中号字体（2倍宽）
    //<B></B>      大号字体（2倍高宽）
    //<C></C>      居中
    //<CM></CM>    中号字体居中
    //<CD></CD>    中号字体居中
    //<CB></CB>    大号字体居中
    //<QR></QR>  二维码图片地址
    //<QRI></QRI>  二维码图片地址
    //<PCN></PCN>  公众号
    // var m_start_bytes       = new Buffer([27, 50, 27, 97, 0, 29, 33, 1]);
    // var m_end_bytes         = new Buffer([29, 33, 0]);
    // var b_start_bytes       = new Buffer([27, 50, 27, 97, 0, 29, 33, 17]);
    // var b_end_bytes         = new Buffer([29, 33, 0]);
    var c_start_bytes       = new Buffer([27, 97, 1]);
    var c_end_bytes         = new Buffer([]); // [ 27, 97, 0 ];
    // var d_start_bytes       = new Buffer([27, 50, 27, 97, 0, 29, 33, 16]);
    // var d_end_bytes         = new Buffer([29, 33, 0]);
    // var cm_start_bytes      = new Buffer([27, 50, 29, 33, 1, 27, 97, 1]);
    // var cm_end_bytes        = new Buffer([29, 33, 0]);
    // var cd_start_bytes      = new Buffer([27, 50, 29, 33, 16, 27, 97, 1]);
    // var cd_end_bytes        = new Buffer([29, 33, 0]);
    // var cb_start_bytes      = new Buffer([27, 50, 29, 33, 17, 27, 97, 1]);
    // var cb_end_bytes        = new Buffer([29, 33, 0]);
    var reset_bytes         = new Buffer([27, 97, 0, 29, 33, 0, 27, 50]);
    //针对针式调整后
    var m_start_bytes       = new Buffer([27, 33, 16, 28, 33, 8]);
    var m_end_bytes         = new Buffer([27, 33, 0, 28, 33, 0]);
    var b_start_bytes       = new Buffer([27, 33, 48, 28, 33, 12]);
    var b_end_bytes         = new Buffer([27, 33, 0, 28, 33, 0]);
    var cm_start_bytes      = new Buffer([27, 97, 1, 27, 33, 16, 28, 33, 8]);
    var cm_end_bytes        = new Buffer([27, 33, 0, 28, 33, 0]);
    var cb_start_bytes      = new Buffer([27, 97, 1, 27, 33, 48, 28, 33, 12]);
    var cb_end_bytes        = new Buffer([27, 33, 0, 28, 33, 0]);
    var cd_start_bytes      = new Buffer([27, 97, 1, 27, 33, 32, 28, 33, 4]);
    var cd_end_bytes        = new Buffer([27, 33, 0, 28, 33, 0]);
    var d_start_bytes       = new Buffer([27, 33, 32, 28, 33, 4]);
    var d_end_bytes         = new Buffer([27, 33, 0, 28, 33, 0]);

    // 居中
    var align_center_bytes  = new Buffer([27, 97, 1]);
    var align_left_bytes    = new Buffer([27, 97, 0]);
    // 设置行间距 默认值为8即1mm
    var default_space_bytes = new Buffer([27, 50]);
    var none_space_bytes    = new Buffer([27, 51, 0]);
    var b_space_bytes       = new Buffer([27, 51, 120]);
    // 切纸
    var cut_bytes           = new Buffer([27, 105]);
    // 弹钱箱
    var moneybox_bytes      = new Buffer([27, 112, 7]);
    // 蜂鸣 { 27, 66, 次数， 时长 * 50ms }
    var beep_bytes          = new Buffer([ 27, 66, 3, 2 ])

    var bytes = new BufferHelper();
    bytes.concat(init_printer_bytes);
    bytes.concat(default_space_bytes);
    var temp = "";
    for (var i = 0; i < text.length; i++)
    {
        var ch = text[i];
        var index;
        if (ch == '<')
        {
            bytes.concat(iconv.encode(temp, options.encoding));
            temp = "";
            if (text.substring(i, i+3) == "<M>")
            {
                bytes.concat(m_start_bytes); i += 2;
            }
            else if (text.substring(i, i+4) == "</M>")
            {
                bytes.concat(m_end_bytes); i += 3;
            }
            else if (text.substring(i, i+3) == "<B>")
            {
                bytes.concat(b_start_bytes); i += 2;
            }
            else if (text.substring(i, i+4) == "</B>")
            {
                bytes.concat(b_end_bytes); i += 3;
            }
            else if (text.substring(i, i+3) == "<D>")
            {
                bytes.concat(d_start_bytes); i += 2;
            }
            else if (text.substring(i, i+4) == "</D>")
            {
                bytes.concat(d_end_bytes); i += 3;
            }
            else if (text.substring(i, i+3) == "<C>")
            {
                bytes.concat(c_start_bytes); i += 2;
            }
            else if (text.substring(i, i+4) == "</C>")
            {
                bytes.concat(c_end_bytes); i += 3;
            }
            else if (text.substring(i, i+4) == "<CM>")
            {
                bytes.concat(cm_start_bytes); i += 3;
            }
            else if (text.substring(i, i+5) == "</CM>")
            {
                bytes.concat(cm_end_bytes); i += 4;
            }
            else if (text.substring(i, i+4) == "<CD>")
            {
                bytes.concat(cd_start_bytes); i += 3;
            }
            else if (text.substring(i, i+5) == "</CD>")
            {
                bytes.concat(cd_end_bytes); i += 4;
            }
            else if (text.substring(i, i+4) == "<CB>")
            {
                bytes.concat(cb_start_bytes); i += 3;
            }
            else if (text.substring(i, i+5) == "</CB>")
            {
                bytes.concat(cb_end_bytes); i += 4;
            }
            else if (text.substring(i, i+4) == "<QR>")
            {
                index = text.indexOf("</QR>", i + 4);
                if (index != -1)
                {
                    var url = text.substring(i + 4, index);
                    bytes.concat(align_center_bytes);
                    bytes.concat(none_space_bytes);
                    bytes.concat(change_image_url_to_bytes(url));
                    bytes.concat(default_space_bytes);
                    bytes.concat(align_left_bytes);
                    i = index + 4;
                }
                else
                {
                    temp = temp + ch;
                }
            }
            else if (text.substring(i, i+5) == "<QRI>")
            {
                index = text.indexOf("</QRI>", i + 5);
                if (index != -1)
                {
                    var url = text.substring(i + 5, index);
                    bytes.concat(align_center_bytes);
                    bytes.concat(none_space_bytes);
                    bytes.concat(change_image_url_to_bytes(url));
                    bytes.concat(default_space_bytes);
                    bytes.concat(align_left_bytes);
                    i = index + 5;
                }
                else
                {
                    temp = temp + ch;
                }
            }
            else if (text.substring(i, i+5) == "<PCN>")
            {
                index = text.indexOf("</PCN>", i + 5);
                if (index != -1)
                {
                    var url = "http://open.weixin.qq.com/qr/code/?username=" + text.substring(i + 5, index);
                    bytes.concat(align_center_bytes);
                    bytes.concat(none_space_bytes);
                    bytes.concat(change_image_url_to_bytes(url));
                    bytes.concat(default_space_bytes);
                    bytes.concat(align_left_bytes);
                    i = index + 5;
                }
                else
                {
                    temp = temp + ch;
                }
            }
        }
        else if(ch == "\n"){
            temp = temp + ch;
            bytes.concat(iconv.encode(temp, options.encoding));
            bytes.concat(reset_bytes);
            temp = "";
        }
        else
        {
            temp = temp + ch;
        }
    }
    if (temp.length > 0)
    {
        bytes.concat(iconv.encode(temp, options.encoding));
    }
    var line_bytes = new　Buffer([10, 10, 10, 10, 10])
    if (options.tailingLine){
        bytes.concat(line_bytes);
    }
    if (options.cut){
        bytes.concat(cut_bytes);
    }
    if (options.beep){
        bytes.concat(beep_bytes)
    }
    return bytes.toBuffer();
}

var change_image_url_to_bytes = exports.change_image_url_to_bytes = function change_image_url_to_bytes(url, options){
    options = options||{
        encoding: 'UTF8'
    };
    var buffer = new Buffer(iconv.encode(url, options.encoding));

    // var buffer = new Buffer(0);
    // var sync = true;
    // Jimp.read(url, function (err, img) {
    //     if(err) {
    //         console.error(err.message)
    //     }else{
    //         img.resize(250, 250).quality(60).greyscale();
    //         buffer = exchange_image(img, 130);
    //     }
    //     sync = false
    // });
    // while(sync){ Deasync.sleep(100)}
    return buffer;
}

// var download_image = exports.download_image = function download_image(url, path){
//     try{
//         request(url).pipe(fs.createWriteStream(path));
//         return true
//     }catch(e){
//         return false
//     }
// }

// var exchange_image = exports.exchange_image = function exchange_image(img, threshold){
//     var hex;
//     var nl = img.bitmap.width % 256;
//     var nh = parseInt(img.bitmap.width / 256);
//     var bytes = new BufferHelper();
//     // data
//     var data = new Buffer([0, 0, 0]);
//     var line = new Buffer([10]);
//     for (var i = 0; i < parseInt(img.bitmap.height / 24) + 1; i++)
//     {
//         // ESC * m nL nH 点阵图
//         var header = new Buffer([27, 42, 33, nl, nh]);
//         bytes.concat(header);
//         for (var j = 0; j < img.bitmap.width; j++)
//         {
//             data[0] = data[1] = data[2] = 0; // Clear to Zero.
//             for (var k = 0; k < 24; k++)
//             {
//                 if (((i * 24) + k) < img.bitmap.height)   // if within the BMP size
//                 {
//                     hex = img.getPixelColor(j, (i * 24) + k);
//                     if (Jimp.intToRGBA(hex).r <= threshold)
//                     {
//                         data[parseInt(k / 8)] += (128 >> (k % 8));
//                     }
//                 }
//             }
//             var dit = new Buffer([data[0], data[1], data[2]])
//             bytes.concat(dit);
//         }
//         bytes.concat(line);
//     } // data
//     return bytes.toBuffer();
// }