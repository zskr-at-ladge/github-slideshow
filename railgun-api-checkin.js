const https = require('https');

// 从环境变量获取 Cookie
const COOKIE_SIG = process.env.RAILGUN_COOKIE_SIG;
const COOKIE_SESS = process.env.RAILGUN_COOKIE_SESS;

function log(message) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${message}`);
}

function checkin() {
    return new Promise((resolve, reject) => {
        const cookie = `koa:sess.sig=${COOKIE_SIG}; koa:sess=${COOKIE_SESS}`;
        
        const options = {
            hostname: 'railgun.info',
            path: '/api/user/checkin',
            method: 'POST',
            headers: {
                'Cookie': cookie,
                'Content-Type': 'application/json'
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    resolve(result);
                } catch (e) {
                    reject(new Error('Failed to parse response: ' + data));
                }
            });
        });

        req.on('error', reject);
        req.end();
    });
}

async function main() {
    log('开始执行签到任务...');
    
    if (!COOKIE_SIG || !COOKIE_SESS) {
        log('错误: 未设置环境变量 RAELGUN_COOKIE_SIG 和 RAELGUN_COOKIE_SESS');
        process.exit(1);
    }

    try {
        const result = await checkin();
        
        if (result.code === 1) {
            log('✓ 签到成功！');
            log(`消息: ${result.message}`);
            if (result.points !== undefined) {
                log(`今日获得: ${result.points} points`);
            }
        } else {
            log(`签到结果: ${result.message}`);
        }
    } catch (error) {
        log(`错误: ${error.message}`);
        process.exit(1);
    }
    
    log('签到任务完成');
}

main();
