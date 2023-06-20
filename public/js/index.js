var DOG_DEVICE_PATH = null  //加密狗设备路径
$(function(){
    get_dog_path().then(res=>{
        DOG_DEVICE_PATH = res;
    }).catch(err=>{
        alert(err);
    });

    dog_plug_monitor()

    $("#btn_check_dog").click(function(){
        if (DOG_DEVICE_PATH){
            get_dog_id(DOG_DEVICE_PATH).then(res=> {
                alert("加密狗ID:"+res);
                $("#dog_id").text(res);
            }).catch(err=>{
                alert(err);
                $("#dog_id").text("");
            });
        }else{
            alert("请插入加密狗");
            $("#dog_id").text("");
        }
        // check_dog().then(res => {
        //     alert("加密狗ID:"+res);
        //     $("#dog_id").text(res);
        // }).catch(err => {
        //     alert(err);
        //     $("#dog_id").text("");
        // });
    });

    $("#btn_en").click(function(){
        if(!DOG_DEVICE_PATH){
            alert("请插入加密狗");
        }
        // let start_time = new Date();
        encrypt(DOG_DEVICE_PATH).then(res => {
            // let end_time = new Date();
            // let diff = end_time - start_time
            // alert("运行时间："+diff)
            $("#en_text_after").val(res);
        }).catch(err => {
            alert(err);
            $("#en_text_after").val("");
        });
    });
})

function get_dog_path(){  //获取加密狗设备路径
    return new Promise((resolve, reject) => {
        try{
            let s_pnp=new SoftKey3W();
            s_pnp.Socket_UK.onopen = function() {
                s_pnp.FindPort(0);//发送命令取UK的路径
            } 
            
            s_pnp.Socket_UK.onmessage =function got_packet(Msg) 
            {
                let UK_Data = JSON.parse(Msg.data);
                if(UK_Data.type!="Process")
                    return;//如果不是流程处理消息，则跳过
                
                if(UK_Data.LastError!=0){
                    s_pnp.Socket_UK.close();
                    reject("未发现加密锁，请插入加密锁");
                    return false;
                }
                DevicePath=UK_Data.return_value;//获得返回的UK的路径
                resolve(DevicePath);
            }
        }catch(e){
            reject("程序运行异常") 
        } 
    });
}

function dog_plug_monitor(){  //加密狗插拔监测
    let s_pnp=new SoftKey3W();
    //在使用事件插拨时，注意，一定不要关掉Sockey，否则无法监测事件插拨
    s_pnp.Socket_UK.onmessage =function got_packet(Msg) 
    {
        let PnpData = JSON.parse(Msg.data);
        if(PnpData.type=="PnpEvent")//如果是插拨事件处理消息
        {
            if(PnpData.IsIn) 
            {
                alert("UKEY已被插入，被插入的锁的路径是："+PnpData.DevicePath);
                DOG_DEVICE_PATH = PnpData.DevicePath;
            }
            else
            {
                alert("UKEY已被拨出，被拨出的锁的路径是："+PnpData.DevicePath);
                DOG_DEVICE_PATH = null;
            }
        }
    } 
}

function get_dog_id(device_path){ //检测加密狗
    return new Promise((resolve, reject) => {
        try{
            let s_pnp=new SoftKey3W();
            s_pnp.Socket_UK.onopen = function() {
                s_pnp.GetChipID(device_path); //发送命令取加密狗ID
            }
            s_pnp.Socket_UK.onmessage =function got_packet(Msg) 
            {
                let UK_Data = JSON.parse(Msg.data);
                if(UK_Data.type!="Process")
                    return;//如果不是流程处理消息，则跳过
                
                if(UK_Data.LastError!=0){
                    s_pnp.Socket_UK.close();
                    reject("获取加密狗ID出错，错误码："+UK_Data.LastError.toString());
                    return false;
                } 
                dog_id=UK_Data.return_value;
                s_pnp.Socket_UK.close();
                resolve(dog_id);
            }
        }catch(e){
            reject("程序运行异常") 
        } 
    });
}

function encrypt(device_path){ //加密
    return new Promise((resolve, reject) => {
        try{
            let s_pnp=new SoftKey3W();
            s_pnp.Socket_UK.onopen = function() {
                s_pnp.EncString($("#en_text").val(), device_path); //发送加密命令
            } 
            s_pnp.Socket_UK.onmessage =function got_packet(Msg) 
            {
                let UK_Data = JSON.parse(Msg.data);
                if(UK_Data.type!="Process")
                    return;//如果不是流程处理消息，则跳过
                
                if(UK_Data.LastError!=0){
                    s_pnp.Socket_UK.close();
                    reject("加密出错，错误码："+UK_Data.LastError.toString());
                    return false;
                } 
                text=UK_Data.return_value;
                s_pnp.Socket_UK.close();
                resolve(text);
            }
        }catch(e){
            reject("程序运行异常") 
        } 
    });
}

// function check_dog(){ //检测加密狗
//     return new Promise((resolve, reject) => {
//         try{
//             let s_pnp=new SoftKey3W();
//             s_pnp.Socket_UK.onopen = function() {
//                 s_pnp.ResetOrder();//这里调用ResetOrder将计数清零，这样，消息处理处就会收到0序号的消息，通过计数及序号的方式，从而生产流程
//             } 
//             s_pnp.Socket_UK.onmessage =function got_packet(Msg) 
//             {
//                 let UK_Data = JSON.parse(Msg.data);
//                 if(UK_Data.type!="Process")
//                     return;//如果不是流程处理消息，则跳过
                
//                 switch(UK_Data.order) 
//                 {
//                     case 0:
//                         s_pnp.FindPort(0);//发送命令取UK的路径
//                         break;
//                     case 1:
//                         if(UK_Data.LastError!=0){
//                             s_pnp.Socket_UK.close();
//                             reject("未发现加密锁，请插入加密锁");
//                             return false;
//                         }
//                         DevicePath=UK_Data.return_value;//获得返回的UK的路径
//                         s_pnp.GetChipID(DevicePath); //发送命令取加密狗ID
//                         break;
//                     case 2:
//                         if(UK_Data.LastError!=0){
//                             s_pnp.Socket_UK.close();
//                             reject("获取加密狗ID出错，错误码："+UK_Data.LastError.toString());
//                             return false;
//                         } 
//                         dog_id=UK_Data.return_value;
//                         s_pnp.Socket_UK.close();
//                         resolve(dog_id);
//                         break;
//                 }
//             }
//         }catch(e){
//             reject("程序运行异常") 
//         } 
//     });
// }

// function encrypt(){ //加密
//     return new Promise((resolve, reject) => {
//         try{
//             let s_pnp=new SoftKey3W();
//             s_pnp.Socket_UK.onopen = function() {
//                 s_pnp.ResetOrder();//这里调用ResetOrder将计数清零，这样，消息处理处就会收到0序号的消息，通过计数及序号的方式，从而生产流程
//             } 
//             s_pnp.Socket_UK.onmessage =function got_packet(Msg) 
//             {
//                 let UK_Data = JSON.parse(Msg.data);
//                 if(UK_Data.type!="Process")
//                     return;//如果不是流程处理消息，则跳过
                
//                 switch(UK_Data.order) 
//                 {
//                     case 0:
//                         s_pnp.FindPort(0);//发送命令取UK的路径
//                         break;
//                     case 1:
//                         if(UK_Data.LastError!=0){
//                             s_pnp.Socket_UK.close();
//                             reject("未发现加密锁，请插入加密锁");
//                             return false;
//                         }
//                         DevicePath=UK_Data.return_value;//获得返回的UK的路径
//                         s_pnp.EncString($("#en_text").val(), DevicePath); //发送命令取加密狗ID
//                         break;
//                     case 2:
//                         if(UK_Data.LastError!=0){
//                             s_pnp.Socket_UK.close();
//                             reject("加密出错，错误码："+UK_Data.LastError.toString());
//                             return false;
//                         } 
//                         text=UK_Data.return_value;
//                         s_pnp.Socket_UK.close();
//                         resolve(text);
//                         break;
//                 }
//             }
//         }catch(e){
//             reject("程序运行异常") 
//         } 
//     });
// }