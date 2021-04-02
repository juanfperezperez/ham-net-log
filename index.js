const { shell,remote } = require('electron')
const dialog = remote.dialog
const path = require('path')
const fs = require('fs')

const logObj = {
    netControlCall: "",
    netControlName: "",
    date: "netdate",
    puzzler:"",
    answer:"",
    records:[]
}



function addNetEntry(call,name,qth="",answer="",notes=""){
    logObj.records.push({
        call: call,
        name: name,
        qth: qth,
        answer: answer,
        notes: notes
    })
}

function netDataUpdateHandler(event){
    //Set net Data
    logObj[event.target.dataset.prop] = event.target.value
}

function netEntryUpdateHandler(event){
    // console.log(event)
    logObj.records[event.target.dataset.indexNumber][event.target.dataset.prop] = event.target.value
}

function netEntryInputHandler(event){
    validateEntry()
}

function keyUpHandler(event){
    // console.log(event)

    if(event.target.classList.contains("net-entry-input")){
        if(event.keyCode === 13 || (event.ctrlKey && event.keyCode === 13)){
            event.preventDefault()
            document.getElementById("add-button").click()
        }
    } else if(event.ctrlKey && event.keyCode === 13){
        document.getElementById('call-input').focus()
    }
    
}

function visitQrz(event){
    shell.openExternal(`https://www.qrz.com/db/${event.target.value}`)
}


function newEntryItemCall(index){
    let field = document.createElement("input")
    field.type = "text"
    field.classList.add('all-caps')
    field.classList.add("net-entry")
    field.pattern = "[A-Z]{3,10}"
    field.dataset.prop = "call"
    field.dataset.indexNumber = index
    field.value = logObj.records[index].call
    return field
}
function newEntryItemName(index){
    let field = document.createElement("input")
    field.type = "text"
    // field.classList.add('all-caps')
    field.classList.add("net-entry")
    // field.pattern = "[A-Z]{3,10}"
    field.dataset.prop = "name"
    field.dataset.indexNumber = index
    field.value = logObj.records[index].name
    return field
}
function newEntryItemQth(index){
    let field = document.createElement("input")
    field.type = "text"
    // field.classList.add('all-caps')
    field.classList.add("net-entry")
    // field.pattern = "[A-Z]{3,10}"
    field.dataset.prop = "qth"
    field.dataset.indexNumber = index
    field.value = logObj.records[index].qth
    return field
}
function newEntryItemAnswer(index){
    let field = document.createElement("select")
    field.innerHTML = '<option value="">-</option><option value="a">a</option><option value="b">b</option><option value="c">c</option><option value="d">d</option>'
    // field.classList.add('all-caps')
    field.classList.add("net-entry")
    // field.pattern = "[A-Z]{3,10}"
    field.dataset.prop = "answer"
    field.dataset.indexNumber = index
    field.value = logObj.records[index].answer
    return field
}
function newEntryItemNotes(index){
    let field = document.createElement("textarea")
    // field.type = "text"
    // field.classList.add('all-caps')
    field.classList.add("net-entry")
    field.classList.add("notes-area")
    // field.pattern = "[A-Z]{3,10}"
    field.dataset.prop = "notes"
    field.dataset.indexNumber = index
    field.value = logObj.records[index].notes
    return field
}

// end Entry Item Fields


function newTableRow(index){
    let row = document.createElement('tr')
    row.setAttribute('data-index-number',index)
    
    row.appendChild(document.createElement('td')).innerText = index //.appendChild(newEntryItemIndex(index))

    row.appendChild(document.createElement('td')).appendChild(newEntryItemCall(index))

    row.appendChild(document.createElement('td')).appendChild(newEntryItemName(index))
    
    row.appendChild(document.createElement('td')).appendChild(newEntryItemQth(index))

    row.appendChild(document.createElement('td')).appendChild(newEntryItemAnswer(index))

    row.appendChild(document.createElement('td')).appendChild(newEntryItemNotes(index))

    return row
}

function populateTable(){
    document.getElementById("log-table").querySelector("tbody").innerHTML = ""
    logObj.records.forEach((r,i) => {
        document.getElementById("log-table").querySelector("tbody").appendChild(newTableRow(i))
    })
    document.getElementById("index-input").value = logObj.records.length
    document.getElementById('call-input').focus()
}

function updatePage(){

    populateTable()

    assignHandlers()

    validateEntry()
}

function assignHandlers(){
    let headerData = document.getElementsByClassName('net-data')
    for(el of headerData){
        el.addEventListener("input",netDataUpdateHandler)
        el.addEventListener("keyup",keyUpHandler)
    }
    
    let entryData = document.getElementsByClassName('net-entry')
    for(el of entryData){
        el.addEventListener("input",netEntryUpdateHandler)
        el.addEventListener("keyup",keyUpHandler)
    }

    let entryInput = document.getElementsByClassName('net-entry-input')
    for(el of entryInput){
        el.addEventListener("input",validateEntry)
        el.addEventListener("keyup",keyUpHandler)
    }
    
    let callInputs = document.querySelectorAll('[data-prop="call"]')
    for(el of callInputs){
        el.addEventListener("dblclick",visitQrz)
    }

    
    document.getElementById("add-button").addEventListener("click",addButtonClick)
    document.getElementById("export-button").addEventListener("click",exportLog)
    // document.getElementById("date-time").addEventListener("input",(e)=>console.log(e.target.value))
}

function updateFontSize(){
    document.querySelector("body").style.fontSize = `${document.getElementById("base-font-size").value}px`
}

function validateEntry(){
    let call = document.getElementById('call-input')
    console.log(call.checkValidity())
    
    if(!call.checkValidity()){
        document.getElementById("notification-area").innerHTML = ''
        document.getElementById("add-button").disabled =  true
    }else if(logObj.records.map((v) => v.call).includes(call.value)){
        //Error: Duplicate
        document.getElementById("notification-area").innerHTML = '<span class="notification-error">Duplicate</span>'
        document.getElementById("add-button").disabled =  true
    }else{
        document.getElementById("notification-area").innerHTML = ''
        document.getElementById("add-button").disabled =  false
    }
}


function addButtonClick(){
    addNetEntry(
        document.getElementById('call-input').value,
        document.getElementById('name-input').value,
        document.getElementById('qth-input').value
    )
    document.getElementById('call-input').value = ''
    document.getElementById('name-input').value = ''
    document.getElementById('qth-input').value = ''
    updatePage()
}

// function getFilePath(){
//     dialog.showOpenDialog().then((str) => console.log(str.filePaths))
// }

// function saveFilePath(){
//     let path = dialog.showSaveDialogSync()
//     return path
// }

function exportLog() {
    let logFileContent = JSON.stringify(logObj,null,2)
    let logDate = new Date(logObj.date)
    let defaultFileName = `NetLog_${logDate.getFullYear()}${(logDate.getMonth()+1).toString().padStart(2,"0")}${logDate.getDate().toString().padStart(2,"0")}_${logDate.getHours().toString().padStart(2,"0")}${logDate.getMinutes().toString().padStart(2,"0")}.json`
    let targetPath = dialog.showSaveDialogSync({
        title:"Save Log",
        defaultPath: defaultFileName,
        filters:[{
            name:"JSON",
            extensions:["json"]
        }]

    })
    if(targetPath){
        fs.writeFileSync(targetPath,logFileContent)
    }
    // return targetPath
}

window.onload = function(){

    document.getElementById("base-font-size").onchange = updateFontSize
    document.getElementById("base-font-size").value = "16"
    
    let isoString = new Date().toISOString()
    logObj.date = isoString.substring(0, (isoString.indexOf("T")|0) + 6|0)
    document.getElementById("date-time").value = logObj.date
    
    updateFontSize()
    updatePage()
    validateEntry()
    document.getElementById("net-ctl-call").focus()
}