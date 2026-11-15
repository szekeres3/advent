"use strict"

const taskElem = document.getElementById('task-today')
const dateElem = document.getElementById('task-date')
const firstDateButton = document.getElementById('first-date')
const reloadButton = document.getElementById('reload-tasks')
const importButton = document.getElementById('import-tasks')
const importFileInput = document.getElementById('import-taskfile')
const modal = new bootstrap.Modal('#not-found-modal', { toggle: false })
const imodal = new bootstrap.Modal('#import-modal', { toggle: false })
const nextButton = document.getElementById('pag-next')
const prevButton = document.getElementById('pag-prev')

const appKey = 'advent-elte'
const baseURL = 'https://raw.githubusercontent.com/szekeres3/advent/refs/heads/main/src/tasks'

let schedule = {}
let md = null
let currPage = 0

const changeMd = function (pickDate, isForce = false, page = 0) {
    currPage = page
    const pdate = schedule[pickDate]
    if (!pdate) {
        if (isForce) {
            navigateToFirstDate()
        }

        modal.show()
        return
    }

    const pdpage = pdate[page]
    if (!pdpage) {
        if (isForce) {
            navigateToFirstDate()
        }

        modal.show()
        return
    }

    loadMd(pdpage)
}

const navigateToFirstDate = function () {
    const pickDate = '2026-12-01'
    dateElem.value = pickDate
    changeMd(pickDate)
}

const changeTaskPage = function(page) {
    const pickDate = dateElem.value
    if(!(schedule[pickDate])) {
        return
    }
    if(page < 0) {
        return
    }
    if(page >= schedule[pickDate].length ){
        return
    }
    if(currPage == page) {
        return
    }

    currPage = page
    changeMd(pickDate, false, page)
}

firstDateButton.addEventListener('click', navigateToFirstDate)
prevButton.addEventListener('click', () => changeTaskPage(currPage - 1))
nextButton.addEventListener('click', () => changeTaskPage(currPage + 1))

dateElem.addEventListener('change', function (event) {
    const pickDate = event.target.value
    changeMd(pickDate)
})

const reloadSchedule = async function (force = false) {
    const data = await getSchedule(force)
    localStorage.setItem(appKey, JSON.stringify(data))
    schedule = data
}

const importTempTask = async function () {
    imodal.show()
}

const handleTaskFile = async function (event) { // https://developer.mozilla.org/en-US/docs/Web/API/FileReader
    const file = event.target.files[0]

    if (!file) {
        return
    }

    const reader = new FileReader()

    reader.readAsText(file)

    reader.onload = function () {
        displayMd(reader.result)
        imodal.hide()
    }
}

reloadButton.addEventListener('click', () => {
    const force = true
    reloadSchedule(force)

    const pickDate = dateElem.value
    changeMd(pickDate, force)
})
importButton.addEventListener('click', importTempTask)
importFileInput.addEventListener('change', handleTaskFile)

const getSchedule = async function (force = false) {
    const res = await fetch(`${baseURL}/schedule.json`, {
        cache: force ? 'no-cache' : 'default'
    })
    const data = await res.json()

    return data
}

const displayMd = function (htmlDt) {
    taskElem.innerHTML = md.render(htmlDt)
}

const loadMd = async function (name) {
    const res = await fetch(`${baseURL}/${name}`)
    const data = await res.text()

    displayMd(data)
}


const main = async function () {
    md = new markdownit()

    const sstore = localStorage.getItem(appKey)
    if (!sstore) {
        await reloadSchedule()
    } else {
        schedule = JSON.parse(sstore)
    }

    navigateToFirstDate()
}

main()