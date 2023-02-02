class Compiler{
    constructor(el,vm){

        //把vm挂上
        this.vm = vm

        this.el = this.isElementNode(el) ? el:document.querySelector(el)
        let fragment = this.node2fragment(this.el)
        this.compile(fragment)
        this.el.appendChild(fragment)
    }
    isDirective(attrName){
        return attrName.startsWith('v-')    
    }
    compileElement(node){
        let attributes = node.attributes;  
        [...attributes].forEach(attr=>{
            //给value起个别名叫expr   :就是起别名的意思
            let {name,value:expr} = attr;
            if(this.isDirective(name)){
                let [,directive] = name.split('-');
                CompilerUtil[directive](node,expr,this.vm);
            }
        })
    }
    compileText(node){
        let content = node.textContent;
        let reg = /\{\{(.+?)\}\}/;  
        reg.test(content)
        if(reg.test(content)){
            // console.log(content)    //{{school.name}}  {{school.age}}
        }
    }
    compile(node){
        let childNodes = node.childNodes;   
        [...childNodes].forEach(child=>{
            if(this.isElementNode(child)){
                this.compileElement(child);
                this.compile(child)
            }else{
                this.compileText(child)
            }
        })
    }
    node2fragment(node){
        let fragment = document.createDocumentFragment()
        let firstChild; 
        while(firstChild = node.firstChild){    
            fragment.appendChild(firstChild)
        }
        return fragment;
    }
    isElementNode(node){
        return node.nodeType === 1;
    }
}

CompilerUtil = {
    getVal(vm,expr){
        console.log(expr.split('.'));   //["school", "name"]
        // console.log(vm);
        // 第一次data是school:{name:xx,age:xx}  current是"school"   好好看看reduce的用法
        return expr.split(".").reduce((data,current)=>{
            return data[current]
        },vm.$data);
    },
    model(node,expr,vm){    // node是带指令的元素节点  expr是表达式  vm是vue对象
        // console.log('处理v-model指令');
        // console.log(node);  //<input type="text" v-model="school.name">
        // console.log(expr);  //school.name
        console.log(vm);   
        // 在这里要做v-model要做的事
        // 要给输入框一个value属性 node是输入框 node.value = xxxx
        let value = this.getVal(vm,expr) 
        // console.log(value); //HuangHuai
        //把这个value显示到模板上的输入框里
        let fn = this.updater['modelUpdater']
        //调用fn方法
        fn(node,value)
    },
    text(){
        console.log('处理v-text指令');
    },
    html(){
        console.log('处理v-html指令');
    },
    //更新数据
    updater:{
        modelUpdater(node,value){
            node.value = value
        },
        htmlUpdater(){}
    },
}

class Vue{
    constructor(options){
        this.$el = options.el;
        this.$data = options.data;
        if(this.$el){
            new Compiler(this.$el,this)
        }
    }
}