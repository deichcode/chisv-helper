const TASK_TAB_TITLE = "Tasks"
const START_COLUMN_HEADER = "Starts"
const STARTS_LOCAL_COLUMN_HEADER = "Starts\xa0local"

const ENDS_COLUMN_HEADER = "Ends"
const ENDS_LOCAL_COLUMN_HEADER = "Ends\xa0local"

let currentlySettingLocalTimes = false

let dateFormat
let timeFormat

const locale = window.navigator.userLanguage || window.navigator.language;
moment.locale(locale)

const discoverDateFormat = function () {
    if (!$('#testDate').length) {
        let testDate = moment('1999-12-31 13:00')
        console.log(testDate.format(''))
        $('.table-wrapper').before(`<span>Format used by chisv-helper extension for parsing: <span id="testDate">${testDate.local().format('l LT')}</span><br/><small>If this format does not match the format in the table please change either the locale in your profile or in the brows. The settings in the profile change how the date and time is displayed in the table. The settings of the browser change which format is used for parsing.</small></span>`)
        let checkDate = $('#testDate').text()
        $('#testDate').remove()
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
    let currentTabContent = $('section.tab-content > div:visible')
    let tableHead = currentTabContent.find('thead')

    let startsHead = tableHead.find(`div:contains(${START_COLUMN_HEADER})`).closest('th')
    if (!tableHead.find(`div:contains('${STARTS_LOCAL_COLUMN_HEADER}')`).length) {
        let startsLocalHead = startsHead.clone()
        startsLocalHead.find(`div:contains(${START_COLUMN_HEADER})`).text(STARTS_LOCAL_COLUMN_HEADER)
        startsLocalHead.append(`<small style="font-size: .8rem; color:gray">${moment.tz.guess()}</small>`)
        startsHead.after(startsLocalHead)
    }

    let endsHead = tableHead.find(`div:contains(${ENDS_COLUMN_HEADER})`).closest('th')
    if (!tableHead.find(`div:contains('${ENDS_LOCAL_COLUMN_HEADER}')`).length) {
        let endsLocalHead = endsHead.clone()
        endsLocalHead.find(`div:contains(${ENDS_COLUMN_HEADER})`).text(ENDS_LOCAL_COLUMN_HEADER)
        endsLocalHead.append(`<small style="font-size: .8rem; color:gray">${moment.tz.guess()}</small>`)
        endsHead.after(endsLocalHead)
    }

    let tableBody = currentTabContent.find('tbody')
    tableBody.children('tr').each(function (index, tr) {
        let dateText = $(tr).find("[data-label='Date']").text()
        let startCell = $(tr).find("[data-label='Starts']")
        let startText = startCell.text()
        let endCell = $(tr).find("[data-label='Ends']")
        let endText = endCell.text()


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
    window.setTimeout(function () {
        currentlySettingLocalTimes = false
    }, 100)
}

// Select the node that will be observed for mutations
const targetNode = document.getElementsByClassName('section')[0];

// Options for the observer (which mutations to observe)
const config = {childList: true, subtree: true};

// Callback function to execute when mutations are observed
const callback = function (mutationsList, observer) {
    let currentActiveTab = $('nav.tabs').find('.is-active')
    if (!currentlySettingLocalTimes && currentActiveTab.text().trim() === TASK_TAB_TITLE) {
        let taskTabIndex = $('nav.tabs > ul > li').index(currentActiveTab)
        currentlySettingLocalTimes = true
        discoverDateFormat()
        insertLocalTimes(taskTabIndex);
    }
};

// Create an observer instance linked to the callback function
const observer = new MutationObserver(callback);

// Start observing the target node for configured mutations
observer.observe(targetNode, config);

insertLocalTimes()