const TASK_TAB_TITLE = "Tasks"
const START_COLUMN_HEADER = "Starts"
const STARTS_LOCAL_COLUMN_HEADER = "Starts\xa0local"

const ENDS_COLUMN_HEADER = "Ends"
const ENDS_LOCAL_COLUMN_HEADER = "Ends\xa0local"

let currentlySettingLocalTimes = false
let calculateLocalTimesTimer

let dateFormat
let timeFormat

const locale = window.navigator.userLanguage || window.navigator.language;
moment.locale(locale)

const discoverDateFormat = function () {
    if (!$('#testDate').length) {
        let testDate = moment('1999-12-31 13:00')
        $('.table-wrapper').before(`<span>Format used by chisv-helper extension for parsing: <span id="testDate">${testDate.local().format('l LT')}</span><br/><small>If this format does not match the format in the table please change either the locale in your profile or in the brows. The settings in the profile change how the date and time is displayed in the table. The settings of the browser change which format is used for parsing.</small></span>`)
        let checkDate = $('#testDate').text()
        let leadingMonth = checkDate.startsWith('12')
        let leadingYear = checkDate.startsWith('1999')
        let isTwelveHourClock = checkDate.includes('PM')

        if (leadingMonth) {
            dateFormat = "MM-DD-YYYY"
        } else if (leadingYear) {
            dateFormat = "YYYY-MM-DD"
        } else {
            dateFormat = "DD-MM-YYYY"
        }

        if (isTwelveHourClock) {
            timeFormat = "hh:mm a"
        } else {
            timeFormat = "HH:mm"
        }
    }
}

const insertLocalTimes = function () {
    calculateLocalTimesTimer = window.setTimeout(function () {
        let $tasksTab = $(`nav.tabs > ul > li:contains(${TASK_TAB_TITLE})`)
        let tasksTabIndex = $tasksTab.index()
        let taskTabContent = $(`section.tab-content > div:nth-child(${tasksTabIndex + 1})`)
        let tableHead = taskTabContent.find('thead')

        let startsHead = tableHead.find(`div:contains(${START_COLUMN_HEADER})`).closest('th')
        if (!tableHead.find(`div:contains('${STARTS_LOCAL_COLUMN_HEADER}')`).length) {
            let startsLocalHead = startsHead.clone()
            startsLocalHead.find(`div:contains(${START_COLUMN_HEADER})`).text(STARTS_LOCAL_COLUMN_HEADER)
            startsLocalHead.append(`<small style="font-size: .8rem; color:gray">${moment.tz.guess()}</small>`)
            startsLocalHead.removeClass('is-sortable')
            startsHead.after(startsLocalHead)
        }

        let endsHead = tableHead.find(`div:contains(${ENDS_COLUMN_HEADER})`).closest('th')
        if (!tableHead.find(`div:contains('${ENDS_LOCAL_COLUMN_HEADER}')`).length) {
            let endsLocalHead = endsHead.clone()
            endsLocalHead.find(`div:contains(${ENDS_COLUMN_HEADER})`).text(ENDS_LOCAL_COLUMN_HEADER)
            endsLocalHead.append(`<small style="font-size: .8rem; color:gray">${moment.tz.guess()}</small>`)
            endsLocalHead.removeClass('is-sortable')
            endsHead.after(endsLocalHead)
        }

        let tableBody = taskTabContent.find('tbody')
        tableBody.children('tr').each(function (index, tr) {
            let dateText = $(tr).find("[data-label='Date']").text().trim()
            let startCell = $(tr).find("[data-label='Starts']")
            let startText = startCell.text().trim()
            let endCell = $(tr).find("[data-label='Ends']")
            let endText = endCell.text().trim()

            let start = moment.tz(dateText + " " + startText, `${dateFormat} ${timeFormat}`, "Asia/Tokyo")
            let end = moment.tz(dateText + " " + endText, `${dateFormat} ${timeFormat}`, "Asia/Tokyo")

            let localStartsCell = $(tr).find("[data-label='Starts local']")
            if (!localStartsCell.length) {
                localStartsCell = startCell.clone()
                localStartsCell.attr("data-label", "Starts local")
                startCell.after(localStartsCell)
            }
            localStartsCell.text(start.local().format('LT'))
            localStartsCell.append(`<br/><small style="font-size: .8rem; color:gray">${start.local().format('dd,\xa0l')}</small>`)

            let localEndsCell = $(tr).find("[data-label='Ends local']")
            if (!localEndsCell.length) {
                localEndsCell = endCell.clone()
                localEndsCell.attr("data-label", "Ends local")
                endCell.after(localEndsCell)
            }
            localEndsCell.text(end.local().format('LT'))
            localEndsCell.append(`<br/><small style="font-size: .8rem; color:gray">${end.local().format('dd,\xa0l')}</small>`)
        })
        currentlySettingLocalTimes = false
    }, 100)
}

// Select the node that will be observed for mutations
const targetNode = document.getElementsByClassName('section')[0];

// Options for the observer (which mutations to observe)
const config = {attributes: true, attributeFilter: ['class'], childList: true, subtree: true};

// Callback function to execute when mutations are observed
const callback = function (mutationsList, observer) {
    let nodesChangedByApp = mutationsList.filter(m => !["Starts local", "Ends local"].includes(m.target?.attributes["data-label"]?.nodeValue))
    let $conferenceTabNavigation = $('nav.tabs')
    if (!currentlySettingLocalTimes && $conferenceTabNavigation.length && nodesChangedByApp.length) {
        currentlySettingLocalTimes = true
        discoverDateFormat()
        insertLocalTimes();
        $(".is-sortable").on('click', function (event) {
            window.clearTimeout(calculateLocalTimesTimer)
            insertLocalTimes()
        });
    }
    if (currentlySettingLocalTimes && $conferenceTabNavigation.length && nodesChangedByApp.length) {
        window.clearTimeout(calculateLocalTimesTimer)
        insertLocalTimes()
    }
};

// Create an observer instance linked to the callback function
const observer = new MutationObserver(callback);

// Start observing the target node for configured mutations
observer.observe(targetNode, config);

insertLocalTimes()