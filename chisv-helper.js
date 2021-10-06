const TASK_TAB_TITLE = "Tasks"

let VENUE_URL_PATTERN = "chisv.org/conference/"

const START_COLUMN_HEADER = "Starts"
const STARTS_LOCAL_COLUMN_HEADER = "Starts\xa0local"
const STARTS_LOCAL_DATA_LABEL = "Starts local"

const ENDS_COLUMN_HEADER = "Ends"
const ENDS_LOCAL_COLUMN_HEADER = "Ends\xa0local"
const ENDS_LOCAL_DATA_LABEL = "Ends local"

let currentVenueTimeZone = ""

let timeZones = {
    "chi2021": "Asia/Tokyo",
    "uist2021": "Etc/UTC",
    "cscw2021": "Etc/GMT-4",
    "iss2021": "Europe/Warsaw"
}

const columnsDataLabelsCreatedByExtension = [STARTS_LOCAL_DATA_LABEL, ENDS_LOCAL_DATA_LABEL]

let currentlySettingLocalTimes = false
let calculateLocalTimesTimer = undefined

let extensionIsInitialized = false
let tasksTabIndex = undefined
let tasksTabContent = undefined

let dateFormat = undefined
let timeFormat = undefined

observerPageContentChanges()

//Manual call only necessary for better development experience with auto refresh enabled
if (isVenueSubpage()) {
    setLocalTimes()
}

function observerPageContentChanges() {
    const pageContentBelowTopNavBar = document.getElementsByClassName('section')[0]
    const config = {attributes: true, attributeFilter: ['class'], childList: true, subtree: true}
    const pageContentObserver = new MutationObserver(pageContentChangedCallback)
    pageContentObserver.observe(pageContentBelowTopNavBar, config)
}

function pageContentChangedCallback(mutationsList) {
    if (!isVenueSubpage()) {
        return;
    }
    let nodesChangedByApp = mutationsList.filter(m => !columnsDataLabelsCreatedByExtension.includes(m.target?.attributes["data-label"]?.nodeValue))
    let $conferenceTabNavigation = $('nav.tabs')
    let conferenceTabNavigationIsVisible = $conferenceTabNavigation.length
    determineVenue()
    if (currentVenueTimeZone === undefined) {
        return;
    }
    if (!extensionIsInitialized && conferenceTabNavigationIsVisible) {
        initializeExtension()
    }
    if (!currentlySettingLocalTimes && $conferenceTabNavigation.length && nodesChangedByApp.length) {
        currentlySettingLocalTimes = true
        setLocalTimes()
        $(".is-sortable").on('click', function (event) {
            window.clearTimeout(calculateLocalTimesTimer)
            setLocalTimes()
        })
    }
    if (currentlySettingLocalTimes && $conferenceTabNavigation.length && nodesChangedByApp.length) {
        window.clearTimeout(calculateLocalTimesTimer)
        setLocalTimes()
    }
}

function isVenueSubpage() {
    let url = window.location.toString()
    return url.indexOf(VENUE_URL_PATTERN) !== -1
}

function determineVenue() {
    let url = window.location.toString()
    let venueIdentifierStartingIndex = url.indexOf(VENUE_URL_PATTERN) + VENUE_URL_PATTERN.length
    let venueIdentifier = url.substring(venueIdentifierStartingIndex)
    currentVenueTimeZone = timeZones[venueIdentifier]
}

function initializeExtension() {
    setMomentLocale()
    determineTasksTabIndex()
    determineTaskTabContent()
    determineDateTimeFormat()
    insertLocalTimeHeaderCells()
    extensionIsInitialized = true
}

function setMomentLocale() {
    const locale = window.navigator.userLanguage || window.navigator.language
    moment.locale(locale)
}

function determineTasksTabIndex() {
    let $tasksTab = $(`nav.tabs > ul > li:contains(${TASK_TAB_TITLE})`)
    tasksTabIndex = $tasksTab.index()
}

function determineTaskTabContent() {
    tasksTabContent = $(`section.tab-content > div:nth-child(${tasksTabIndex + 1})`)
}

function determineDateTimeFormat() {
    if ($('#testDate').length) {
        return
    }
    insertCheckDate()
    parseCheckDate()
}

function insertCheckDate() {
    let testDate = moment('1999-12-31 13:00')
    $('.table-wrapper').before(`
        <span>
            Format used by chisv-helper extension for parsing: 
            <span id="testDate">${testDate.local().format('l LT')}</span><br/>
            <small>If this format does not match the format in the table please change either the locale in your profile or in the brows. The settings in the profile change how the date and time is displayed in the table. The settings of the browser change which format is used for parsing.</small>
        </span>`
    )
}

function parseCheckDate() {
    let checkDate = $('#testDate').text()
    determineDateFormat(checkDate)
    determineTimeFormat(checkDate)
}

function determineDateFormat(checkDate) {
    let leadingMonth = checkDate.startsWith('12')
    let leadingYear = checkDate.startsWith('1999')

    if (leadingMonth) {
        dateFormat = "MM-DD-YYYY"
    } else if (leadingYear) {
        dateFormat = "YYYY-MM-DD"
    } else {
        dateFormat = "DD-MM-YYYY"
    }
}

function determineTimeFormat(checkDate) {
    let isTwelveHourClock = checkDate.includes('PM')
    if (isTwelveHourClock) {
        timeFormat = "hh:mm a"
    } else {
        timeFormat = "HH:mm"
    }
}

function insertLocalTimeHeaderCells() {
    let tableHead = tasksTabContent.find('thead')
    insertLocalTimeHeaderCell(tableHead, START_COLUMN_HEADER, STARTS_LOCAL_COLUMN_HEADER)
    insertLocalTimeHeaderCell(tableHead, ENDS_COLUMN_HEADER, ENDS_LOCAL_COLUMN_HEADER)
}

function insertLocalTimeHeaderCell(tableHead, originalTimeCellText, localTimeCellText) {
    let localTimeCellNotExists = !tableHead.find(`div:contains('${localTimeCellText}')`).length
    if (localTimeCellNotExists) {
        let originalTimeCell = tableHead.find(`div:contains(${originalTimeCellText})`).closest('th')
        let localTimeCell = originalTimeCell.clone()
        localTimeCell.find(`div:contains(${originalTimeCellText})`).text(localTimeCellText)
        localTimeCell.append(`<small style="font-size: .8rem; color:gray">${moment.tz.guess()}</small>`)
        localTimeCell.removeClass('is-sortable')
        originalTimeCell.after(localTimeCell)
    }
}

function insertLocalTimeCell(currentRow, originalTimeCell, localCellDataLabel) {
    let localTimeCell = $(currentRow).find(`[data-label='${localCellDataLabel}']`)
    if (!localTimeCell.length) {
        localTimeCell = originalTimeCell.clone()
        localTimeCell.attr("data-label", localCellDataLabel)
        originalTimeCell.after(localTimeCell)
    }
    return localTimeCell
}

function setLocalTimes() {
    calculateLocalTimesTimer = window.setTimeout(function () {
        if(tasksTabContent === undefined) { return }
        let tableBody = tasksTabContent.find('tbody')
        tableBody.children('tr').each(function (index, task) {
            setLocalTime(task);
        })
        currentlySettingLocalTimes = false
    }, 100)
}

function setLocalTime(task) {
    let startsCell = $(task).find("[data-label='Starts']")
    let localStartsCell = insertLocalTimeCell(task, startsCell, STARTS_LOCAL_DATA_LABEL)

    let endsCell = $(task).find("[data-label='Ends']")
    let localEndsCell = insertLocalTimeCell(task, endsCell, ENDS_LOCAL_DATA_LABEL)

    let dateText = $(task).find("[data-label='Date']").text().trim()
    let start = parseDate(startsCell, dateText)
    let end = parseDate(endsCell, dateText)

    displayLocalTime(localStartsCell, start);
    displayLocalTime(localEndsCell, end)
}

function parseDate(timeCell, dateText) {
    let timeText = timeCell.text().trim()
    return moment.tz(dateText + " " + timeText, `${dateFormat} ${timeFormat}`, currentVenueTimeZone)
}

function displayLocalTime(localTimeCell, time) {
    localTimeCell.text(time.local().format('LT'))
    localTimeCell.append(`<br/><small style="font-size: .8rem; color:gray">${time.local().format('dd,\xa0l')}</small>`)
}