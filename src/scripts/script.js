const HUNT_B = [2919,2920,2921,2922,2923,2924,2925,2926,2927,2928,2929,2930,2931,2932,2933,2934,2935,4350,4351,4352,4353,4354,4355,4356,4357,4358,4359,4360,4361,6002,6003,6004,6005,6006,6007,6008,6009,6010,6011,6012,6013,8908,8909,8913,8914,8903,8904,8656,8657,8893,8894,8898,8899,8916,10635,10636,10616,10637,10638,10639,10640,10641,10642,10643,10644,10645,10646,13144,13145,13407,13146,13147,13148,13149,13150,13151,13152,13153,13154,13155],
      HUNT_A = [2936,2937,2938,2939,2940,2941,2942,2943,2944,2945,2946,2947,2948,2949,2950,2951,2952,4362,4363,4364,4365,4366,4367,4368,4369,4370,4371,4372,4373,5996,5997,5998,5999,6000,6001,5990,5991,5992,5993,5994,5995,8906,8907,8911,8912,8901,8902,8654,8655,8891,8892,8896,8897,10624,10623,10625,10626,10627,10628,10630,10629,10632,10631,10634,10633,13361,13362,13442,13443,12753,12692,13400,13401,13157,13158,13435,13436],
      HUNT_S = [2953,2954,2955,2956,2957,2958,2959,2960,2961,2962,2963,2964,2965,2966,2967,2968,2969,4374,4375,4376,4377,4378,4380,5984,5985,5986,5987,5988,5989,8905,8910,8900,8653,8890,8895,8915,10617,10615,10618,10619,10620,10621,10622,13360,13406,13444,12754,13399,13156,13437],
      
      settingRgx  = /(?:.*?)(?:은|는) 존재하지 않는 명령어입니다\./im,
      instanceRgx = /^(인스턴스 지역 )(?:.*?)[](?:으로|로) 이동했습니다\./im,
      insIconRgx  = /[]/im,
      serverRgx   = /^[ㄱ-힣]+ 서버로 이동했습니다\./im,

      serverList = [0, 'dev', 2075, '초코보', 2076, '초코보', 2077, '모그리', 2078, '톤베리', 2079, '캐트시', 2080, '펜리르', 2081, '오메가']
      gas = 'https://script.google.com/macros/s/AKfycbzf4qe5N_v3FoUsGr1edi1dtTlp7uOKbd5brKgBsioEXy1SlwL1pc2V4rsrVjXNQ5KQ/exec'

let HuntsArr = {}

let myId = null,
    myName = null,
    homeWorldid = 0,
    homeWorld = null,
    currWorldid = 0,
    currWorld = null,
    currZoneId = 0,
    ins = 0,
    currZoneName = null,
    chanegedby = null,
    entityid = null,
    bnpcId = null,
    bnpcNameId = null,
    dbgMode = 1

 catchLogs = (data) => {
    const log = data
    const logLine = data.line
    const rawLine = data.rawLine

    timeSplit(logLine[1])
    entityid = String(logLine[2])

    switch (logLine[0]) {
        case '00' :
            logType = logLine[0]
        
            switch (logLine[2]) {
                case '0039' :
                    str = logLine[4]
                    if(instanceRgx.test(str)) {
                        insSearch(str.match(insIconRgx))
                    }
                    if(serverRgx.test(str)) {
                        currWorld = str.split(' ')[0]
                        currWorldid = serverList[serverList.indexOf(currWorld) - 1]
                        console.log(`[${hour}:${minute}] 서버가 변경되었습니다. 현재 서버: ${currWorld}`)
                    }
                break
            }
        break
        
        case '01' :
            logType = logLine[0]
            currZoneId   = parseInt(logLine[2], 16)
            currZoneName = logLine[3]
            ins = 1
            console.log(`[${hour}:${minute}] 지역을 이동했습니다. (현재 지역: ${currZoneName} | 인스턴스: ${ins})`)
            HuntsArr = {}
            chanegedby = '01'
        break

        case '02' :
            logType = logLine[0]
            if(myId === null) {
                myId = logLine[2]
                console.log(`[${hour}:${minute}] ID가 설정되었습니다. (ID: ${myId})`)
            }

            if(myName === null) {
                myName = logLine[3]
                console.log(`[${hour}:${minute}] 이름이 설정되었습니다. (이름: ${myName})`)
            }
        break

        case '03' :
            logType = logLine[0]
            entityName  = logLine[3]
            Worldid     = parseInt(logLine[7], 16)
            bnpcNameId  = parseInt(logLine[9])
            currHp      = parseInt(logLine[11])
            maxHp       = parseInt(logLine[12])

            if(myId === entityid && homeWorldid == 0) {
                homeWorldid = Number(Worldid)
                homeWorld = serverList[serverList.indexOf(homeWorldid) + 1]
                console.log(`[${hour}:${minute}] 고향 서버가 인식되었습니다. (고향 서버: ${homeWorld})`)
            }

            addHunts()
        break

        case '04' :
            logType = logLine[0]
            entityName  = logLine[3]
            Worldid     = parseInt(logLine[7], 16)
            bnpcNameId  = parseInt(logLine[9])
            currHp      = parseInt(logLine[11])
            maxHp       = parseInt(logLine[12])
            
            addHunts()
            removeHunts()
        break

        case '25' :
            logType = logLine[0]
            currHp  = parseInt(logLine[5])
            removeHunts()
        break

        case '37' :
            logType = logLine[0]
            currHp  = parseInt(logLine[5])
            removeHunts()
        break
    }
}

//시간 분리 후 배열 전환
timeSplit = (e) => {
    date        = e.split('T')[0]
    year        = date.split('-')[0]
    month       = date.split('-')[1]
    day         = date.split('-')[2]
    time        = e.split('T')[1].includes('+') ? e.split('T')[1].split('+')[0] : e.split('T')[1].split('-')[0]
    hour        = time.split(':')[0]
    minute      = time.split(':')[1]
    second      = time.split(':')[2].split('.')[0]
    millisecond = time.split(':')[2].split('.')[1]
    timezone    = 'GMT' + (e.split('T')[1].includes('+') ? '+' + e.split('T')[1].split('+')[1] : '-' + e.split('T')[1].split('-')[1])
    timestamp   = new Date(`${year}-${month}-${day} ${hour}:${minute}:${second}`)

    dateValue   = {timestamp, date, year, month, day, time, hour, minute, second, timezone, millisecond}
}

addHunts = () => {
    if((HUNT_B.includes(bnpcNameId) || HUNT_A.includes(bnpcNameId) || HUNT_S.includes(bnpcNameId)) && currHp > 0) {
        HuntsArr.hasOwnProperty(entityid) ||
        (
            HuntsArr[entityid] = {entityName, bnpcNameId, currHp, maxHp, dateValue},
            console.log(`[${hour}:${minute}] ${entityid}(${HuntsArr[entityid].entityName})이/가 배열에 추가됐습니다. 현재 배열에 저장된 개수: ${Object.keys(HuntsArr).length}`)
        )
    }
}

removeHunts = () => {
    if(HuntsArr.hasOwnProperty(entityid) && currHp === 0) {
        postHunts(entityid)
        targetid = entityid
        targetname = HuntsArr[entityid].entityName
        console.log(`[${hour}:${minute}] ${targetid}(${targetname})을/를 배열에서 삭제합니다.`)
        delete HuntsArr[entityid]
        console.log(`[${hour}:${minute}] ${targetid}(${targetname})을/를 배열에서 삭제했습니다. 현재 배열에 저장된 개수: ${Object.keys(HuntsArr).length}`)
        targetid = null
        targetname = null
    }
}

//인스턴스 값 서치
insSearch = (e) => {
    nowIns = '' == e ? 1 :
             '' == e ? 2 :
             '' == e ? 3 :
             '' == e ? 4 :
             '' == e ? 5 :
             '' == e ? 6 :
             '' == e ? 7 :
             '' == e ? 8 :
             '' == e ? 9 : null

    //인스턴스 변경
    if(ins !== nowIns) {
        ins = nowIns
        console.log(`[${hour}:${minute}] 인스턴스가 변경되었습니다. 현재 인스턴스: ${ins}`)

        //zone 변경 로그가 뜨지 않는 오류가 생겼을 때, 인스턴스 로그만 떴으면 초기화
        if(chanegedby === '00') {
            HuntsArr = {}
            console.log(`[${hour}:${minute}] 인스턴스가 변경되어 배열이 초기화 되었습니다.`)
        }
        chanegedby = '00'
    }
}

postHunts = (e) => {
    if( myId !== null && myName !== null && homeWorldid !== 0 && currWorldid !== 0 && ins !== 0 && e !== null ) {
        console.log(`[${hour}:${minute}] Post 시도 중...`)
        $.ajax({
            type: "GET",
            url: gas,
            data: {
                'id'         : myId,
                'name'       : myName,
                'homeWorldid': homeWorldid,
                'currWorldid': currWorldid,
                'ins'        : ins,
                'entityid'   : e,
                'bnpcNameId' : HuntsArr[e].bnpcNameId,
                'dateValue'  : HuntsArr[e].dateValue
            },
            success: function(response){console.log("susccess")},
            error: function(xhr, status, error) {console.log("Error: " + error)}
        })
        console.log(`[${hour}:${minute}] Post 완료`)
    }
}
addOverlayListener('LogLine', catchLogs);
startOverlayEvents();
