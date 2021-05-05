const TASK_TAB_TITLE = "Tasks"
const START_COLUMN_HEADER = "Starts"
const STARTS_LOCAL_COLUMN_HEADER = "Starts local"

const ENDS_COLUMN_HEADER = "Ends"
const ENDS_LOCAL_COLUMN_HEADER = "Ends local"

let currentlySettingLocalTimes = false

const locale = window.navigator.userLanguage || window.navigator.language;
moment.locale(locale)

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


        let start = moment.tz(dateText + " " + startText, "D.M.YYYY HH:mm", "Asia/Tokyo")
        let end = moment.tz(dateText + " " + endText, "D.M.YYYY HH:mm", "Asia/Tokyo")

        let localStartsCell = $(tr).find("[data-label='Starts local']")
        if(!localStartsCell.length) {
            localStartsCell = startCell.clone()
            localStartsCell.attr("data-label", "Starts local")
            startCell.after(localStartsCell)
        }
        localStartsCell.text(start.local().format('dd,\xa0D.M.YYYY HH:mm'))

        let localEndsCell = $(tr).find("[data-label='Ends local']")
        if(!localEndsCell.length) {
            localEndsCell = endCell.clone()
            localEndsCell.attr("data-label", "Ends local")
            endCell.after(localEndsCell)
        }
        localEndsCell.text(end.local().format('dd,\xa0D.M.YYYY HH:mm'))
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
    console.log("mutation and state is: ", currentlySettingLocalTimes)
    let currentActiveTab = $('nav.tabs').find('.is-active')
    if (!currentlySettingLocalTimes && currentActiveTab.text().trim() === TASK_TAB_TITLE) {
        let taskTabIndex = $('nav.tabs > ul > li').index(currentActiveTab)
        currentlySettingLocalTimes = true
        insertLocalTimes(taskTabIndex);
    }
};

// Create an observer instance linked to the callback function
const observer = new MutationObserver(callback);

// Start observing the target node for configured mutations
observer.observe(targetNode, config);

insertLocalTimes()