#!/usr/bin/env node
const { exec } = require('shelljs');
const git = require('simple-git')();
const CFonts = require('cfonts');
const fs = require('fs');
const path = require('path')

const clg = (str) => {
    CFonts.say(str, {
        font: 'block', // define the font face
        align: 'left', // define text alignment
        colors: ['#fff', '#ff8344'], // define all colors
        background: 'transparent', // define the background color, you can also use `backgroundColor` here as key
        letterSpacing: 1, // define letter spacing
        lineHeight: 1, // define the line height
        space: true, // define if the output text should have empty lines on top and on the bottom
        maxLength: '0', // define how many character can be on one line
    });
}
const start = () => {
    return new Promise((reslove, reject) => {
        git
            .add('./*', () => {
                console.log('add done')
            })
            .commit("await", () => {
                console.log('commit done')
            })
            .push('origin', 'master', () => {
                exec(`
        ssh blog> /dev/null 2>&1 << eeooff
        cd NoteBook/;
        git fetch --all;
        git reset --hard origin/master;
        git pull;
        `);
                clg('push done!')
                console.log('push done');
                reslove()

            });
    })

}
/**
 * 实现需求
 * 打包 docs  文件夹部署gitbook
 * 打包 _book 文件夹部署服务器
 * 
 */
const AR = {
    // 常量
    includefile: 'roll',
    console: {
        font: 'block', // define the font face
        align: 'left', // define text alignment
        colors: ['#fff', '#ff8344'], // define all colors
        background: 'transparent', // define the background color, you can also use `backgroundColor` here as key
        letterSpacing: 1, // define letter spacing
        lineHeight: 1, // define the line height
        space: true, // define if the output text should have empty lines on top and on the bottom
        maxLength: '0', // define how many character can be on one line
    },
    clog(str, config) {
        const setting = config || this.console
        CFonts.say(str, setting)
    },
    inster_template(rollpath) {
        let data = fs.readFileSync(rollpath, 'utf8').split('\n')
        const isServer = Boolean(~data[0].indexOf('extends'));
        if (isServer) {
            data = data.filter((e, i) => {
                return (i !== 0 && i !== (data.length - 1))
            })
        } else {
            data.unshift('{% extends "../blocks.md" %} {% block contain %}')
            data.splice(data.length, 0, '{% endblock %}')
        }
        console.log(data);
        
        fs.writeFileSync(rollpath, data.join('\n'), 'utf8')
    },
    find_file(dirpath) {
        const dirs = (err, dir) => {
            if (err) return err;
            dir.forEach(file => {
                const isincludefile = Boolean(~file.indexOf(this.includefile));
                if (isincludefile) {
                    const fileurl = path.join(dirpath, file);
                    const filter_file = (rerr, rolls) => {
                        rolls.forEach(roll => {
                            const ismd = Boolean(~roll.indexOf('.md'));
                            if (ismd) {
                                this.inster_template(path.join(fileurl, roll))
                            }
                        })
                    }
                    fs.readdir(fileurl, 'utf8', filter_file)
                }
            });
        }
        fs.readdir(dirpath, 'utf8', dirs)
    },
    build_server() {
        this.find_file(__dirname)
    },

    start() {
        exec(`gitbook build . ./docs`);
        console.log('build docs done!');
        this.build_server();
        exec(`gitbook build . ./_book`);
        console.log('build _book done!');
        this.build_server();
        git
            .add('./*', () => {
                console.log('add done')
            })
            .commit("await", () => {
                console.log('commit done')
            })
            .push('origin', 'master', () => {
                exec(`
                    ssh blog> /dev/null 2>&1 << eeooff
                    cd NoteBook/;
                    git fetch --all;
                    git reset --hard origin/master;
                    git pull;
                    `);
                this.clog('push done!')
            });
    }

}

AR.start();
// AR.find_file(__dirname)
// const rollpath = path.join(__dirname, 'test.md');
// let data = fs.readFileSync(rollpath, 'utf8').split('\n')
// const isServer = Boolean(~data[0].indexOf('第一行'));
// if (isServer) {
//     data = data.filter((e, i) => {
//         return (i !== 0 && i !== (data.length - 1))
//     })
// } else {
//     data.unshift('第一行插入文件测试')
//     data.splice(data.length, 0, '最后一行插入内容测试')
// }
// fs.writeFileSync(rollpath, data.join('\n'), 'utf8')

