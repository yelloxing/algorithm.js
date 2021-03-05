/*!
 * 🔪 algorithm.js - 🔪 一些前端常用的算法实现合集。
 * git+https://github.com/hai2007/algorithm.js.git
 *
 * author 你好2007 < https://hai2007.gitee.io/sweethome >
 *
 * version 0.5.1
 *
 * Copyright (c) 2020-present hai2007 走一步，再走一步。
 * Released under the MIT license
 *
 * Date:Sat Jan 16 2021 11:56:30 GMT+0800 (GMT+08:00)
 */
(function () {
    'use strict';

    /*!
     * 🔪 - 基本的树结构位置生成算法
     * https://github.com/hai2007/algorithm.js/blob/master/tree.js
     *
     * author hai2007 < https://hai2007.gitee.io/sweethome >
     *
     * Copyright (c) 2020-present hai2007 走一步，再走一步。
     * Released under the MIT license
     */


    function tree (_config) {

        /**
         * 无论绘制的树结构是什么样子的
         * 计算时都假想目标树的样子如下：
         *  1.根结点在最左边，且上下居中
         *  2.树是从左往右生长的结构
         *  3.每个结点都是一块1*1的正方形，top和left分别表示正方形中心的位置
         */

        var config = _config || {},
            // 维护的树
            alltreedata,
            // 根结点ID
            rootid;

        /**
         * 把内部保存的树结点数据
         * 计算结束后会调用配置的绘图方法
         */
        var update = function () {

            var beforeDis = [], size = 0, maxDeep = 0;
            (function positionCalc(pNode, deep) {

                if (deep > maxDeep) maxDeep = deep;
                var flag;
                for (flag = 0; flag < pNode.children.length; flag++)
                    // 因为全部的子结点的位置确定了，父结点的y位置就是子结点的中间位置
                    // 因此有子结点的，先计算子结点
                    positionCalc(alltreedata[pNode.children[flag]], deep + 1);

                // left的位置比较简单，deep从0开始编号
                // 比如deep=0，第一层，left=0+0.5=0.5，也就是根结点
                alltreedata[pNode.id].left = deep + 0.5;
                if (flag == 0) {

                    // beforeDis是一个数组，用以记录每一层此刻top下边缘（每一层是从上到下）
                    // 比如一层的第一个，top值最小可以取top=0.5
                    // 为了方便计算，beforeDis[deep] == undefined的时候表示现在准备计算的是这层的第一个结点
                    // 因此设置最低上边缘为-0.5
                    if (beforeDis[deep] == undefined) beforeDis[deep] = -0.5;
                    // 父边缘同意的进行初始化
                    if (beforeDis[deep - 1] == undefined) beforeDis[deep - 1] = -0.5;

                    // 添加的新结点top值第一种求法：本层上边缘+1（比如上边缘是-0.5，那么top最小是top=-0.5+1=0.5）
                    alltreedata[pNode.id].top = beforeDis[deep] + 1;

                    var pTop = beforeDis[deep] + 1 + (alltreedata[pNode.pid].children.length - 1) * 0.5;
                    // 计算的原则是：如果第一种可行，选择第一种，否则必须选择第二种
                    // 判断第一种是否可行的方法就是：如果第一种计算后确定的孩子上边缘不对导致孩子和孩子的前兄弟重合就是可行的
                    if (pTop - 1 < beforeDis[deep - 1])
                        // 必须保证父亲结点和父亲的前一个兄弟保存1的距离，至少
                        // 添加的新结点top值的第二种求法：根据孩子取孩子结点的中心top
                        alltreedata[pNode.id].top = beforeDis[deep - 1] + 1 - (alltreedata[pNode.pid].children.length - 1) * 0.5;

                } else {

                    // 此刻flag!=0
                    // 意味着结点有孩子，那么问题就解决了，直接取孩子的中间即可
                    // 其实，flag==0的分支计算的就是孩子，是没有孩子的叶结点，那是关键
                    alltreedata[pNode.id].top = (alltreedata[pNode.children[0]].top + alltreedata[pNode.children[flag - 1]].top) * 0.5;
                }

                // 因为计算孩子的时候
                // 无法掌握父辈兄弟的情况
                // 可能会出现父亲和兄弟重叠问题
                if (alltreedata[pNode.id].top <= beforeDis[deep]) {
                    var needUp = beforeDis[deep] + 1 - alltreedata[pNode.id].top;
                    (function doUp(_pid, _deep) {
                        alltreedata[_pid].top += needUp;
                        if (beforeDis[_deep] < alltreedata[_pid].top) beforeDis[_deep] = alltreedata[_pid].top;
                        var _flag;
                        for (_flag = 0; _flag < alltreedata[_pid].children.length; _flag++) {
                            doUp(alltreedata[_pid].children[_flag], _deep + 1);
                        }
                    })(pNode.id, deep);
                }

                // 计算好一个结点后，需要更新此刻该层的上边缘
                beforeDis[deep] = alltreedata[pNode.id].top;

                // size在每次计算一个结点后更新，是为了最终绘图的时候知道树有多宽（此处应该叫高）
                if (alltreedata[pNode.id].top + 0.5 > size) size = alltreedata[pNode.id].top + 0.5;

            })(alltreedata[rootid], 0);

            // 传递的参数分别表示：记录了位置信息的树结点集合、根结点ID和树的宽
            return {
                "node": alltreedata,
                "root": rootid,
                "size": size,
                "deep": maxDeep + 1
            };

        };

        /**
         * 根据配置的层次关系（配置的id,child,root）把原始数据变成内部结构，方便后期位置计算
         * @param {any} initTree
         *
         * tempTree[id]={
         *  "data":原始数据,
         *  "pid":父亲ID,
         *  "id":唯一标识ID,
         *  "children":[cid1、cid2、...]
         * }
         */
        var toInnerTree = function (initTree) {

            var tempTree = {};
            // 根结点
            var temp = config.root(initTree), id, rid;
            id = rid = config.id(temp);
            tempTree[id] = {
                "data": temp,
                "pid": null,
                "id": id,
                "children": []
            };

            var num = 1;
            // 根据传递的原始数据，生成内部统一结构
            (function createTree(pdata, pid) {
                var children = config.child(pdata, initTree), flag;
                num += children ? children.length : 0;
                for (flag = 0; children && flag < children.length; flag++) {
                    id = config.id(children[flag]);
                    tempTree[pid].children.push(id);
                    tempTree[id] = {
                        "data": children[flag],
                        "pid": pid,
                        "id": id,
                        "children": []
                    };
                    createTree(children[flag], id);
                }
            })(temp, id);

            return {
                value: [rid, tempTree],
                num: num
            };
        };

        // 可以传递任意格式的树原始数据
        // 只要配置对应的解析方法即可
        var tree = function (initTree) {

            var treeData = toInnerTree(initTree);
            alltreedata = treeData.value[1];
            rootid = treeData.value[0];

            if (treeData.num == 1) {
                alltreedata[rootid].left = 0.5;
                alltreedata[rootid].top = 0.5;
                return {
                    deep: 1,
                    node: alltreedata,
                    root: rootid,
                    size: 1
                };
            }

            return update();
        };

        // 获取根结点的方法:root(initTree)
        tree.root = function (rootback) {
            config.root = rootback;
            return tree;
        };

        // 获取子结点的方法:child(parentTree,initTree)
        tree.child = function (childback) {
            config.child = childback;
            return tree;
        };

        // 获取结点ID方法:id(treedata)
        tree.id = function (idback) {
            config.id = idback;
            return tree;
        };

        return tree;

    }

    var $RegExp = {

        // 空白字符:http://www.w3.org/TR/css3-selectors/#whitespace
        blankReg: new RegExp("[\\x20\\t\\r\\n\\f]"),
        blanksReg: /^[\x20\t\r\n\f]{0,}$/,

        // 标志符
        identifier: /^[a-zA-Z_$][0-9a-zA-Z_$]{0,}$/,

    };

    var toString = Object.prototype.toString;

    /**
     * 获取一个值的类型字符串[object type]
     *
     * @param {*} value 需要返回类型的值
     * @returns {string} 返回类型字符串
     */
    function getType (value) {
        if (value == null) {
            return value === undefined ? '[object Undefined]' : '[object Null]';
        }
        return toString.call(value);
    }

    /**
     * 判断一个值是不是String。
     *
     * @param {*} value 需要判断类型的值
     * @returns {boolean} 如果是String返回true，否则返回false
     */
    function _isString (value) {
        var type = typeof value;
        return type === 'string' || (type === 'object' && value != null && !Array.isArray(value) && getType(value) === '[object String]');
    }

    var isString = _isString;
    var isArray = function (input) { return Array.isArray(input) };

    // 分析结点的属性
    function analyseTag (attrString) {
        var attr = {}, index = 0;

        attrString = attrString.trim();

        var getOneAttr = function () {

            // 属性名和属性值
            var attrName = "", attrValue = "";

            // 先寻找属性名
            for (; index < attrString.length; index++) {

                // 寻找属性名的时候遇到空白或结尾的时候，肯定没有属性值
                if ($RegExp.blanksReg.test(attrString[index]) || index == attrString.length - 1) {

                    attrName += attrString[index];

                    // 如果属性名是空白，就不需要记录了
                    if (!$RegExp.blanksReg.test(attrName)) {
                        attr[attrName.trim()] = "";
                    }
                    index += 1;
                    break;

                }

                // 如果遇到等号，说明属性名寻找结束了
                else if (attrString[index] == '=') {

                    // 接着寻找属性值
                    index += 1;

                    // 由于属性可能由引号包裹或直接暴露
                    var preCode = null, preLeng = -1;

                    // 如果是由'或者"包裹
                    if (attrString.substr(index, 1) == '"' || attrString.substr(index, 1) == "'") {
                        preCode = attrString.substr(index, 1);
                        preLeng = 1;
                        index += 1;
                    }

                    // 如果是由\'或\"包裹
                    else if (attrString.substr(index, 2) == '\"' || attrString.substr(index, 2) == "\'") {
                        preCode = attrString.substr(index, 2);
                        preLeng = 2;
                        index += 2;
                    }

                    // 开始正式寻找属性值

                    // 如果没有包裹，是直接暴露在外面的
                    // 我们寻找到空格或结尾即可
                    if (preCode !== null) {

                        for (; index < attrString.length; index++) {
                            if (attrString.substr(index, preLeng) == preCode) {
                                attr[attrName.trim()] = attrValue.trim();
                                index += 2;
                                break;
                            } else {
                                attrValue += attrString[index];
                            }
                        }

                    }

                    // 如果是包裹的
                    // 我们确定寻找到对应的包裹闭合即可
                    else {
                        for (; index < attrString.length; index++) {
                            if ($RegExp.blanksReg.test(attrString[index])) {
                                attr[attrName.trim()] = attrValue.trim();
                                index += 1;
                                break;
                            } else {
                                attrValue += attrString[index];
                            }
                        }
                    }

                    break;

                } else {
                    attrName += attrString[index];
                }
            }

            // 如果还有字符串，继续解析
            if (index < attrString.length) {
                getOneAttr();
            }

        };

        getOneAttr();

        return attr;
    }

    function nextTagFun (template) {

        var i = -1,

            // 当前面对的字符
            currentChar = null;

        // 如果前面是获取的js或css，还有pre等开始标签，比较特殊，直接寻址闭合的
        var preIsSpecial = false, specialCode = "";
        var specialTag = ['script', 'pre', 'style', 'code'];

        // 获取下一个字符
        var next = function () {
            currentChar = i++ < template.length - 1 ? template[i] : null;
            return currentChar;
        };

        // 获取往后n个值
        var nextNValue = function (n) {
            return template.substring(i, n + i > template.length ? template.length : n + i);
        };

        next();
        // 剔除开头的空白
        while ($RegExp.blankReg.test(currentChar) && i < template.length - 1) next();


        /**
         * 一个Tag存在哪些类型？如下：
         * 1.<tag-name>       { tagName:'tag-name', type:'beginTag', attrs:{} }      开始标签
         * 2.</tag-name>      { tagName:'tag-name', type:'endTag'   }                结束标签
         * 3.<tag-name />     { tagName:'tag-name', type:'fullTag',  attrs:{} }      自闭合标签
         * 4.text             { tagName:'text',     type:'textcode' }                文本结点
         * 5.<!-- text -->    { tagName:'text',     type:'comment'  }                注释
         * 6.<!DOCTYPE text>  { tagName:'text',     type:'DOCTYPE'  }                声明
         *
         *
         */
        return function () {

            var tag = currentChar, tagObj = {};

            if (tag == null) return null;

            /**
             * 特殊标签内容获取
             * ========================================
             */

            // 如果是获取特殊标签里面的内容
            // 先不考虑里面包含'</XXX>'
            if (preIsSpecial) {
                tagObj.type = 'textcode';
                tagObj.tagName = tag;
                while (nextNValue(specialCode.length + 3) != '</' + specialCode + '>' && i < template.length) {
                    tagObj.tagName += next();
                }
                tagObj.tagName = tagObj.tagName.replace(/<$/, '');
                preIsSpecial = false;
                return tagObj;
            }

            /**
             * 特殊标签获取
             * ========================================
             */
            // 针对特殊的comment
            if (nextNValue(4) == '<!--') {
                tagObj.type = 'comment';
                tagObj.tagName = tag;
                while (nextNValue(3) != '-->' && i < template.length) {
                    tagObj.tagName += next();
                }
                next(); next(); next();
                tagObj.tagName = tagObj.tagName.replace(/^<!--/, '').replace(/-$/, '');
                return tagObj;
            }

            // 针对特殊的doctype
            if (nextNValue(9) == '<!DOCTYPE') {
                tagObj.type = 'DOCTYPE';
                tagObj.tagName = tag;
                while (nextNValue(1) != '>' && i < template.length) {
                    tagObj.tagName += next();
                }
                next();
                tagObj.tagName = tagObj.tagName.replace(/^<!DOCTYPE/, '').replace(/>$/, '');
                return tagObj;
            }

            /**
             * 普通的
             * ========================================
             */

            // 如果是期望归结非文本结点
            else if (tag == '<') {

                // 标记是否处于属性值是字符串包裹中
                var isAttrString = false, attrLeftValue = null, attrLeftLen = null;

                // 如果在包裹中或者没有遇到‘>’说明没有结束
                while ((isAttrString || currentChar != '>') && i < template.length) {

                    tag += next();

                    // 如果是包裹里面，试探是否即将遇到了结束
                    if (isAttrString) {

                        var next23Value = nextNValue(attrLeftLen + 1).substring(1);
                        if (next23Value == attrLeftValue) {
                            isAttrString = false;
                        }

                    }

                    // 如果在包裹外面，试探是否即将进入包裹
                    else {

                        var next23Value = nextNValue(2);
                        if (next23Value == '="' || next23Value == "='") {
                            attrLeftValue = next23Value.replace('=', '');
                            attrLeftLen = 1;
                            isAttrString = true;
                        }

                        next23Value = nextNValue(3);
                        if (next23Value == '=\"' || next23Value == "=\'") {
                            attrLeftValue = next23Value.replace('=', '');
                            attrLeftLen = 2;
                            isAttrString = true;
                        }

                    }


                }

                // 针对特殊的结束标签
                if (/^<\//.test(tag)) {
                    tagObj.tagName = tag.replace(/^<\//, '').replace(/>$/, '');
                    tagObj.type = 'endTag';
                } else {

                    if (/\/>$/.test(tag)) {
                        tagObj.type = 'fullTag';
                        tag = tag.replace(/\/>$/, '');
                    } else {
                        tagObj.type = 'beginTag';
                        tag = tag.replace(/>$/, '');
                    }

                    tag = tag.replace(/^</, '');

                    tagObj.tagName = "";
                    var j = 0;
                    for (; j < tag.length; j++) {
                        if (tag[j] == ' ') break;
                        tagObj.tagName += tag[j];
                    }

                    var attrString = tag.substring(j);
                    if ($RegExp.blanksReg.test(attrString)) {
                        tagObj.attrs = {};
                    } else {
                        tagObj.attrs = analyseTag(attrString);
                    }

                }

            }

            // 如果是归结文本结点
            // 如果文本中包含<的先忽略考虑
            else {
                tagObj.type = 'textcode';
                tagObj.tagName = currentChar;
                while (nextNValue(1) != '<' && i < template.length) {
                    tagObj.tagName += next();
                }
                tagObj.tagName = tagObj.tagName.replace(/<$/, '');
                i -= 1;
            }


            // 如果遇到开始script或者style、pre等特殊标签，标记开始获取特殊文本
            if (tagObj.type == 'beginTag') {
                if (specialTag.indexOf(tagObj.tagName.toLowerCase()) > -1) {
                    preIsSpecial = true;
                    specialCode = tagObj.tagName;
                }

            }

            // 如果遇到结束script或者style、pre等特殊标签，标记结束获取特殊文本
            else if (tagObj.type == 'endTag') {
                if (specialTag.indexOf(tagObj.tagName.toLowerCase()) > -1) {
                    preIsSpecial = false;
                }
            }

            next();

            return tagObj;

        };

    }

    // 分析deep
    // 我们会在这里校对那些没有结束标签的开始标签
    // 这步结束以后，每个都是一个单独的标签
    // 也就是不用再区分开始或闭合了
    function analyseDeep (tagArray) {

        // 闭合标签
        tagArray = closeTag(tagArray);

        var deep = 0, tagDeepArray = [];

        tagArray.forEach(function (tag) {

            if (tag.type == 'beginTag') {

                tagDeepArray.push({
                    type: "tag",
                    name: tag.tagName,
                    attrs: tag.attrs,
                    __deep__: ++deep,
                    __tagType__: "double"
                });

            } else if (tag.type == 'endTag') {

                deep -= 1;


            } else if (tag.type == 'textcode') {

                // 如果是文本
                tagDeepArray.push({
                    type: "text",
                    content: tag.tagName,
                    __deep__: deep + 1
                });

            } else if (tag.type == 'comment') {

                // 如果是注释
                tagDeepArray.push({
                    type: "comment",
                    content: tag.tagName,
                    __deep__: deep + 1
                });

            } else {

                // 如果是自闭合结点
                tagDeepArray.push({
                    type: "tag",
                    name: tag.tagName,
                    attrs: tag.attrs,
                    __deep__: deep + 1,
                    __tagType__: "single"
                });

            }

        });

        return tagDeepArray;

    }
    // 标记所有没有闭合结点的直接自闭合
    var closeTag = function (tagArray) {

        var needClose = [];

        tagArray.forEach(function (tag, i) {
            if (tag.type == 'beginTag') {

                needClose.push([i, tag.tagName]);

            } else if (tag.type == 'endTag') {

                while (needClose.length > 0) {

                    var needCloseTag = needClose.pop();

                    if (needCloseTag[1] == tag.tagName) {
                        break;
                    } else {
                        tagArray[needCloseTag[0]].type = 'fullTag';
                    }

                }

            }
        });

        return tagArray;
    };

    /*!
     * 🔪 - 解析xhtml为json对象返回
     * https://github.com/hai2007/algorithm.js/blob/master/xhtmlToJson.js
     *
     * author hai2007 < https://hai2007.gitee.io/sweethome >
     *
     * Copyright (c) 2020-present hai2007 走一步，再走一步。
     * Released under the MIT license
     */

    // 获取一棵DOM树
    // noIgnore为true表示不忽略任何标签
    function xhtmlToJson (template, noIgnore) {

        if (!isString(template)) throw new Error("Template must be a String!");

        // 获取读取下一个标签对象
        var nextTag = nextTagFun(template.trim());

        var tag = nextTag(), DomTree = [];
        while (tag != null) {

            if (tag.type == 'textcode' && $RegExp.blanksReg.test(tag.tagName)) ; else if (tag.type == 'DOCTYPE') ; else if (tag.type == 'comment') {

                // 注释目前也默认过滤掉，除非显示声明不忽略
                if (noIgnore) {
                    DomTree.push(tag);
                }

            } else {
                DomTree.push(tag);
            }

            tag = nextTag();
        }

        // 分析层次
        DomTree = analyseDeep(DomTree);

        /**
         * 模仿浏览器构建的一棵树,每个结点有如下属性：
         *
         * 1.parentNode index  父结点
         * 2.childNodes []     孩子结点
         * 3.preNode    index  前一个兄弟结点
         * 4.nextNode   index  后一个兄弟结点
         *
         * 5.attrs:{}          当前结点的属性
         * 6.name              节点名称
         * 7.type              节点类型（tag和text）
         * 8.content           文本结点内容
         *
         * 需要注意的是：如果一个文本结点内容只包含回车，tab，空格等空白字符，会直接被忽视
         */

        var presNode = [null], preDeep = 0;
        for (var i = 0; i < DomTree.length; i++) {

            // 当前结点
            var currentIndex = i, currentDeep = DomTree[i].__deep__;
            DomTree[i].childNodes = [];
            DomTree[i].preNode = null;
            DomTree[i].nextNode = null;

            // 前置三个结点
            var lastPre = presNode[presNode.length - 1];
            var last2Pre = presNode.length > 1 ? presNode[presNode.length - 2] : null;


            // 如果遇到的是兄弟结点
            if (currentDeep == preDeep) {

                // 修改兄弟关系
                DomTree[currentIndex].preNode = lastPre;
                DomTree[lastPre].nextNode = currentIndex;

                // 修改父子关系
                DomTree[currentIndex].parentNode = last2Pre;
                DomTree[last2Pre].childNodes.push(currentIndex);

                // 校对presNode
                presNode[presNode.length - 1] = currentIndex;
            }

            // 如果是遇到了孩子
            else if (currentDeep > preDeep) {

                // 修改兄弟关系
                // todo

                // 修改父子关系
                DomTree[currentIndex].parentNode = lastPre;
                if (lastPre != null) DomTree[lastPre].childNodes.push(currentIndex);

                // 校对presNode
                presNode.push(currentIndex);
            }

            // 如果是遇到了祖先
            else {

                var preTempIndex = presNode[presNode.length - 1 - (preDeep - currentDeep)];
                var preTemp2Index = presNode[presNode.length - 2 - (preDeep - currentDeep)];

                // 修改兄弟关系
                DomTree[currentIndex].preNode = preTempIndex;
                if (preTempIndex != null) DomTree[preTempIndex].nextNode = currentIndex;

                // 修改父子关系
                DomTree[currentIndex].parentNode = preTemp2Index;
                if (preTemp2Index != null) DomTree[preTemp2Index].childNodes.push(currentIndex);

                // 校对presNode
                for (var j = 0; j < preDeep - currentDeep; j++) { presNode.pop(); }
                presNode[presNode.length - 1] = currentIndex;

            }

            preDeep = currentDeep;

        }

        return DomTree;

    }

    // 把表达式按照最小单位切割
    // 后续我们的任务就是对这个数组进行归约即可(归约交付给别的地方，这里不继续处理)

    /**
     * 例如：
     *  target={
     *      a:{
     *              value:9
     *         },
     *      b:7,
     *      flag:'no'
     *  }
     *  express= "a.value>10 && b< 11 ||flag=='yes'"
     * 变成数组以后应该是：
     *
     * // 比如最后的yes@value表示这是一个最终的值，不需要再计算了
     * ['a','[@value','value@value',']@value','>@value','10@value','&&@value','b','<@value','||@value','flag','==@value','yes@value']
     *
     * 然后，进一步解析得到：
     * [{value:9},'[','value',']','>',10,'&&',7,'<','||','no','==','yes']
     *
     * (当然，我们实际运算的时候，可能和这里不完全一致，这里只是为了方便解释我们的主体思想)
     *
     * 然后我们返回上面的结果即可！
     */

    // 除了上述原因，统一前置处理还有一个好处就是：
    // 可以提前对部分语法错误进行报错，方便定位调试
    // 因为后续的操作越来越复杂，错误越提前越容易定位

    var specialCode1 = ['+', '-', '*', '/', '%', '&', '|', '!', '?', ':', '[', ']', '(', ")", '>', '<', '='];
    var specialCode2 = ['+', '-', '*', '/', '%', '&', '|', '!', '?', ':', '>', '<', '=', '<=', '>=', '==', '===', '!=', '!=='];

    function analyseExpress (target, express, scope) {

        // 剔除开头和结尾的空白
        express = express.trim();

        var i = -1,

            // 当前面对的字符
            currentChar = null;

        // 获取下一个字符
        var next = function () {
            currentChar = i++ < express.length - 1 ? express[i] : null;
            return currentChar;
        };

        // 获取往后n个值
        var nextNValue = function (n) {
            return express.substring(i, n + i > express.length ? express.length : n + i);
        };

        next();

        var expressArray = [];
        while (true) {

            if (i >= express.length) break;

            // 先匹配普通的符号
            // + - * / %
            // && || !
            // ? :
            // [ ] ( )
            // > < >= <= == === != !==
            // 如果是&或者|比较特殊

            if (specialCode1.indexOf(currentChar) > -1) {

                // 对于特殊的符号
                if (['&', '|', '='].indexOf(currentChar) > -1) {
                    if (['==='].indexOf(nextNValue(3)) > -1) {
                        expressArray.push(nextNValue(3));
                        i += 2; next();
                    } else if (['&&', '||', '=='].indexOf(nextNValue(2)) > -1) {
                        expressArray.push(nextNValue(2));
                        i += 1; next();
                    } else {
                        throw new Error("Illegal expression : " + express + "\nstep='analyseExpress',index=" + i);
                    }
                }


                else {

                    // 拦截部分比较特殊的
                    if (['!=='].indexOf(nextNValue(3)) > -1) {
                        expressArray.push(nextNValue(3));
                        i += 2; next();
                    } else if (['>=', '<=', '!='].indexOf(nextNValue(2)) > -1) {
                        expressArray.push(nextNValue(2));
                        i += 1; next();
                    }

                    // 普通的单一的
                    else {
                        expressArray.push(currentChar);
                        next();
                    }

                }
            }

            // 如果是字符串
            else if (['"', "'"].indexOf(currentChar) > -1) {
                var temp = "", beginTag = currentChar;
                next();

                // 如果没有遇到结束标签
                // 目前没有考虑 '\'' 这种带转义字符的情况，当然，'\"'这种是支持的
                // 后续如果希望支持，优化这里即可
                while (currentChar != beginTag) {
                    if (i >= express.length) {

                        // 如果还没有遇到结束标识就结束了，属于字符串未闭合错误
                        throw new Error("String unclosed error : " + express + "\nstep='analyseExpress',index=" + i);

                    }

                    // 继续拼接
                    temp += currentChar;
                    next();
                }
                expressArray.push(temp + "@string");
                next();
            }

            // 如果是数字
            else if (/\d/.test(currentChar)) {
                var dotFlag = 'no'; // no表示还没有匹配到.，如果已经匹配到了，标识为yes，如果匹配到了.，可是后面还没有遇到数组，标识为error
                var temp = currentChar; next();
                while (i < express.length) {
                    if (/\d/.test(currentChar)) {
                        temp += currentChar;
                        if (dotFlag == 'error') dotFlag = 'yes';
                    } else if ('.' == currentChar && dotFlag == 'no') {
                        temp += currentChar;
                        dotFlag = 'error';
                    } else {
                        break;
                    }
                    next();
                }

                // 如果小数点后面没有数字，辅助添加一个0
                if (dotFlag == 'error') temp += "0";
                expressArray.push(+temp);
            }

            // 如果是特殊符号
            // 也就是类似null、undefined等
            else if (['null', 'true'].indexOf(nextNValue(4)) > -1) {
                expressArray.push({
                    "null": null,
                    "true": true
                }[nextNValue(4)]);
                i += 3; next();
            } else if (['false'].indexOf(nextNValue(5)) > -1) {
                expressArray.push({
                    'false': false
                }[nextNValue(5)]);
                i += 4; next();
            } else if (['undefined'].indexOf(nextNValue(9)) > -1) {
                expressArray.push({
                    "undefined": undefined
                }[nextNValue(9)]);
                i += 8; next();
            }

            // 如果是空格
            else if ($RegExp.blankReg.test(currentChar)) {
                do {
                    next();
                } while ($RegExp.blankReg.test(currentChar) && i < express.length);
            }

            else {

                var dot = false;

                // 对于开头有.进行特殊捕获，因为有.意味着这个值应该可以变成['key']的形式
                // 这是为了和[key]进行区分，例如：
                // .key 等价于 ['key'] 翻译成这里就是 ['[','key',']']
                // 可是[key]就不一样了，翻译成这里以后应该是 ['[','这个值取决当前对象和scope',']']
                // 如果这里不进行特殊处理，后续区分需要额外的标记，浪费资源
                if (currentChar == '.') {
                    dot = true;
                    next();
                }

                // 如果是标志符
                /**
                 *  命名一个标识符时需要遵守如下的规则：
                 *  1.标识符中可以含有字母 、数字 、下划线_ 、$符号
                 *  2.标识符不能以数字开头
                 */
                // 当然，是不是关键字等我们就不校对了，因为没有太大的实际意义
                // 也就是类似flag等局部变量

                if ($RegExp.identifier.test(currentChar)) {

                    var len = 1;
                    while (i + len <= express.length && $RegExp.identifier.test(nextNValue(len))) len += 1;
                    if (dot) {
                        expressArray.push('[');
                        expressArray.push(nextNValue(len - 1) + '@string');
                        expressArray.push(']');
                    } else {
                        var tempKey = nextNValue(len - 1);
                        // 如果不是有前置.，那就是需要求解了
                        var tempValue = tempKey in scope ? scope[tempKey] : target[tempKey];
                        expressArray.push(isString(tempValue) ? tempValue + "@string" : tempValue);
                    }
                    i += (len - 2); next();
                }

                // 都不是，那就是错误
                else {
                    throw new Error("Illegal express : " + express + "\nstep='analyseExpress',index=" + i);
                }
            }

        }

        // 实际情况是，对于-1等特殊数字，可能存在误把1前面的-号作为运算符的错误，这里拦截校对一下
        var length = 0;
        for (var j = 0; j < expressArray.length; j++) {
            if (["+", "-"].indexOf(expressArray[j]) > -1 &&
                // 如果前面的也是运算符或开头，这个应该就不应该是运算符了
                (j == 0 || specialCode2.indexOf(expressArray[length - 1]) > -1)) {
                expressArray[length++] = +(expressArray[j] + expressArray[j + 1]);
                j += 1;
            } else {
                expressArray[length++] = expressArray[j];
            }
        }
        expressArray.length = length;

        return expressArray;
    }

    var getExpressValue = function (value) {
        // 这里是计算的内部，不需要考虑那么复杂的类型
        if (typeof value == 'string') return value.replace(/@string$/, '');
        return value;
    };

    var setExpressValue = function (value) {
        if (typeof value == 'string') return value + "@string";
        return value;
    };

    function evalValue (expressArray) {

        // 采用按照优先级顺序归约的思想进行

        // 需要明白，这里不会出现括号
        // （小括号或者中括号，当然，也不会有函数，这里只会有最简单的表达式）
        // 这也是我们可以如此归约的前提

        // + - * / %
        // && || !
        // ? :
        // > < >= <= == === != !==

        // !
        // 因为合并以后数组长度一定越来越短，我们直接复用以前的数组即可
        var length = 0, i = 0;
        for (; i < expressArray.length; i++) {
            if (expressArray[i] == '!') {
                // 由于是逻辑运算符，如果是字符串，最后的@string是否去掉已经没有意义了
                expressArray[length] = !expressArray[++i];
            } else expressArray[length] = expressArray[i];
            length += 1;
        }
        if (length == 1) return getExpressValue(expressArray[0]);
        expressArray.length = length;

        // * / %
        length = 0;
        for (i = 0; i < expressArray.length; i++) {
            if (expressArray[i] == '*') {
                // 假设不知道一定正确，主要是为了节约效率，是否提供错误提示，再议
                expressArray[length - 1] = getExpressValue(expressArray[length - 1]) * getExpressValue(expressArray[++i]);
            } else if (expressArray[i] == '/') {
                expressArray[length - 1] = getExpressValue(expressArray[length - 1]) / getExpressValue(expressArray[++i]);
            } else if (expressArray[i] == '%') {
                expressArray[length - 1] = getExpressValue(expressArray[length - 1]) % getExpressValue(expressArray[++i]);
            } else {

                // 上面不会导致数组增长
                expressArray[length++] = expressArray[i];
            }

        }
        if (length == 1) return getExpressValue(expressArray[0]);
        expressArray.length = length;

        // + -
        length = 0;
        for (i = 0; i < expressArray.length; i++) {
            if (expressArray[i] == '+') {
                expressArray[length - 1] = setExpressValue(getExpressValue(expressArray[length - 1]) + getExpressValue(expressArray[++i]));
            } else if (expressArray[i] == '-') {
                expressArray[length - 1] = getExpressValue(expressArray[length - 1]) - getExpressValue(expressArray[++i]);
            } else expressArray[length++] = expressArray[i];
        }
        if (length == 1) return getExpressValue(expressArray[0]);
        expressArray.length = length;

        // > < >= <=
        length = 0;
        for (i = 0; i < expressArray.length; i++) {
            if (expressArray[i] == '>') {
                expressArray[length - 1] = getExpressValue(expressArray[length - 1]) > getExpressValue(expressArray[++i]);
            } else if (expressArray[i] == '<') {
                expressArray[length - 1] = getExpressValue(expressArray[length - 1]) < getExpressValue(expressArray[++i]);
            } else if (expressArray[i] == '<=') {
                expressArray[length - 1] = getExpressValue(expressArray[length - 1]) <= getExpressValue(expressArray[++i]);
            } else if (expressArray[i] == '>=') {
                expressArray[length - 1] = getExpressValue(expressArray[length - 1]) >= getExpressValue(expressArray[++i]);
            } else expressArray[length++] = expressArray[i];
        }
        if (length == 1) return getExpressValue(expressArray[0]);
        expressArray.length = length;

        // == === != !==
        length = 0;
        for (i = 0; i < expressArray.length; i++) {
            if (expressArray[i] == '==') {
                expressArray[length - 1] = getExpressValue(expressArray[length - 1]) == getExpressValue(expressArray[++i]);
            } else if (expressArray[i] == '===') {
                expressArray[length - 1] = getExpressValue(expressArray[length - 1]) === getExpressValue(expressArray[++i]);
            } else if (expressArray[i] == '!=') {
                expressArray[length - 1] = getExpressValue(expressArray[length - 1]) != getExpressValue(expressArray[++i]);
            } else if (expressArray[i] == '!==') {
                expressArray[length - 1] = getExpressValue(expressArray[length - 1]) !== getExpressValue(expressArray[++i]);
            } else expressArray[length++] = expressArray[i];
        }
        if (length == 1) return getExpressValue(expressArray[0]);
        expressArray.length = length;

        // && ||
        length = 0;
        for (i = 0; i < expressArray.length; i++) {
            if (expressArray[i] == '&&') {
                expressArray[length - 1] = getExpressValue(expressArray[length - 1]) && getExpressValue(expressArray[1 + i]);
                i += 1;
            } else if (expressArray[i] == '||') {
                expressArray[length - 1] = getExpressValue(expressArray[length - 1]) || getExpressValue(expressArray[1 + i]);
                i += 1;
            } else expressArray[length++] = expressArray[i];
        }
        if (length == 1) return getExpressValue(expressArray[0]);
        expressArray.length = length;

        // ?:
        length = 0;
        for (i = 0; i < expressArray.length; i++) {
            if (expressArray[i] == '?') {
                expressArray[length - 1] = getExpressValue(expressArray[length - 1]) ? getExpressValue(expressArray[i + 1]) : getExpressValue(expressArray[i + 3]);
                i += 3;
            } else expressArray[length++] = expressArray[i];
        }
        if (length == 1) return getExpressValue(expressArray[0]);
        expressArray.length = length;

        throw new Error('Unrecognized expression : [' + expressArray.toString() + "]");

    }

    function calcValue (target, expressArray, scope) {
        var value = expressArray[0] in scope ? scope[expressArray[0]] : target[expressArray[0]];
        for (var i = 1; i < expressArray.length; i++) {
            try {
                value = value[expressArray[i]];
            } catch (e) {
                console.error({
                    target: target,
                    scope: scope,
                    expressArray: expressArray,
                    index: i
                });
                throw e;
            }
        }
        return value;
    }

    // 小括号去除方法

    var doit1 = function (target, expressArray, scope) {

        // 先消小括号
        // 其实也就是归约小括号
        if (expressArray.indexOf('(') > -1) {

            var newExpressArray = [], temp = [],
                // 0表示还没有遇到左边的小括号
                // 1表示遇到了一个，以此类推，遇到一个右边的会减1
                flag = 0;
            for (var i = 0; i < expressArray.length; i++) {
                if (expressArray[i] == '(') {
                    if (flag > 0) {
                        // 说明这个应该是需要计算的括号里面的括号
                        temp.push('(');
                    }
                    flag += 1;
                } else if (expressArray[i] == ')') {
                    if (flag > 1) temp.push(')');
                    flag -= 1;

                    // 为0说明主的小括号归约结束了
                    if (flag == 0) {
                        var _value = evalValue(doit1(target, temp));
                        newExpressArray.push(isString(_value) ? _value + '@string' : _value);
                        temp = [];
                    }
                } else {
                    if (flag > 0) temp.push(expressArray[i]);
                    else newExpressArray.push(expressArray[i]);
                }
            }
            expressArray = newExpressArray;
        }

        // 去掉小括号以后，调用中括号去掉方法
        return doit2(expressArray);

    };

    // 中括号嵌套去掉方法

    var doit2 = function (expressArray) {

        var hadMore = true;
        while (hadMore) {

            hadMore = false;

            var newExpressArray = [], temp = [],

                // 如果为true表示当前在试探寻找归约最小单元的结束
                flag = false;

            // 开始寻找里面需要归约的最小单元（也就是可以立刻获取值的）
            for (var i = 0; i < expressArray.length; i++) {

                // 这说明这是一个需要归约的
                // 不过不一定是最小单元
                // 遇到了，先记下了
                if (expressArray[i] == '[' && i != 0 && expressArray[i - 1] != ']') {
                    if (flag) {
                        // 如果之前已经遇到了，说明之前保存的是错误的，需要同步会主数组
                        newExpressArray.push('[');
                        for (var j = 0; j < temp.length; j++) newExpressArray.push(temp[j]);
                    } else {
                        // 如果之前没有遇到，修改标记即可
                        flag = true;
                    }
                    temp = [];
                }

                // 如果遇到了结束，这说明当前暂存的就是最小归结单元
                // 计算后放回主数组
                else if (expressArray[i] == ']' && flag) {
                    hadMore = true;

                    // 计算
                    var tempValue = evalValue(temp);
                    var _value = newExpressArray[newExpressArray.length - 1][tempValue];
                    newExpressArray[newExpressArray.length - 1] = isString(_value) ? _value + "@string" : _value;

                    // 状态恢复
                    flag = false;
                } else {

                    if (flag) {
                        temp.push(expressArray[i]);
                    } else {
                        newExpressArray.push(expressArray[i]);
                    }

                }
            }

            expressArray = newExpressArray;

        }

        return expressArray;
    };

    // 路径
    // ["[",express,"]","[",express"]","[",express,"]"]
    // 变成
    // [express][express][express]

    var doit3 = function (expressArray) {
        var newExpressArray = [], temp = [];
        for (var i = 0; i < expressArray.length; i++) {
            if (expressArray[i] == '[') {
                temp = [];
            } else if (expressArray[i] == ']') {
                newExpressArray.push(evalValue(temp));
            } else {
                temp.push(expressArray[i]);
            }
        }
        return newExpressArray;
    };

    // 获取路径数组(核心是归约的思想)

    function toPath(target, expressArray, scope) {

        var newExpressArray = doit1(target, expressArray);

        // 其实无法就三类
        // 第一类：[express][express][express]express
        // 第二类：express
        // 第三类：[express][express][express]

        var path;

        // 第二类
        if (newExpressArray[0] != '[') {
            path = [evalValue(newExpressArray)];
        }

        // 第三类
        else if (newExpressArray[newExpressArray.length - 1] == ']') {
            path = doit3(newExpressArray);
        }

        // 第一类
        else {
            var lastIndex = newExpressArray.lastIndexOf(']');
            var tempPath = doit3(newExpressArray.slice(0, lastIndex + 1));
            var tempArray = newExpressArray.slice(lastIndex + 1);
            tempArray.unshift(calcValue(target, tempPath, scope));
            path = [evalValue(tempArray)];
        }

        return path;
    }

    /*!
     * 🔪 - 设置或获取指定对象上字符串表达式对应的值
     * https://github.com/hai2007/algorithm.js/blob/master/value.js
     *
     * author hai2007 < https://hai2007.gitee.io/sweethome >
     *
     * Copyright (c) 2020-present hai2007 走一步，再走一步。
     * Released under the MIT license
     */

    /**
     * express举例子：
     *
     * [00]  ["a"].b[c]
     * [01]  a
     * [02]  [0]['value-index'][index+1]
     *
     * 如果是getValue,express还可以包含运算符：
     *  + - * / %  数值运算符
     *  && || !    逻辑运算符
     *
     * [03]  flag+10
     * [04]  a.b[index+1]-10
     * [05]  (a+b)/10-c[d]
     * [06]  [((a+b)-c)*f]+d
     *
     * [07]  !flag
     * [08]  (a>0 && b<=1) || !flag
     * [09]  '(flag)' == "("+temp+")"
     * [10]  a>10?"flag1":"flag2"
     *
     */

    // 解析一段表达式
    var evalExpress = function (target, express, scope) {
        if (arguments.length < 3) scope = {};

        var expressArray = analyseExpress(target, express, scope);
        var path = toPath(target, expressArray, scope);

        // 如果不是表达式
        if (path.length > 1) throw new Error("Illegal expression : " + express + "\nstep='evalExpress',path=" + path + ",expressArray=" + expressArray);

        return path[0];
    };

    // 获取
    var getValue = function (target, express, scope) {
        if (arguments.length < 3) scope = {};

        var expressArray = analyseExpress(target, express, scope);
        var path = toPath(target, expressArray, scope);
        return calcValue(target, path, scope);
    };

    // 设置
    var setValue = function (target, express, value, scope) {
        if (arguments.length < 3) scope = {};

        var expressArray = analyseExpress(target, express, scope);
        var path = toPath(target, expressArray, scope);

        var _target = target;
        for (var i = 0; i < path.length - 1; i++) {

            // 如果需要补充
            if (!(path[i] in _target)) _target[path[i]] = isArray(_target) ? [] : {};

            // 拼接下一个
            _target = _target[path[i]];
        }

        _target[path[path.length - 1]] = value;
        return target;
    };

    // 导出
    var algorithm = {
        tree: tree,
        xhtmlToJson: xhtmlToJson,
        evalExpress: evalExpress,
        getValue: getValue,
        setValue: setValue
    };

    if (typeof module === "object" && typeof module.exports === "object") {
        module.exports = algorithm;
    } else {
        window.algorithm = algorithm;
    }

}());
