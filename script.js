/*

 * Creates a calendar that lets users add, remove, complete, and edit events and visually displays created events on calendar
*/

/*--------------------Colour Bank----------------------*/
/*                    
                       #FA897B Red
                       #FFDD94 Yellow
                       #D2FDBB Green
                       #E9D3FF Purple

*/

//Used to creates an area to store events
class Events {
  //initializes todos
  initializeList(list) {
    let storedTodos = JSON.parse(localStorage.getItem("todos"));
    if (list === 1) {
      storedTodos = JSON.parse(localStorage.getItem("completed"));
    }

    //determines if there are events in local storage
    if (storedTodos) {
      return storedTodos;
    }
    return {};
  }

  //stores completed list events (in local storage)
  #completed = this.initializeList(1);

  // #completed = {};

  //stores todo list events (in local storage)
  #todo = this.initializeList(0);

  // #todo = {};

  //creates new ToDo task
  createToDo(year, month, day, theEventName, theImportance, theNote, category) {
    this.addEvent(0, year, month, day, theEventName, theImportance, theNote, category);

    Calendar.generateErrorCard(1,1)
  }

  //create new completed task
  createComplete(year, month, day, theEventName, theImportance, theNote, category) {
    this.addEvent(1, year, month, day, theEventName, theImportance, theNote, category);
  }

  //moves todo task to completed task (deletes the todo and creates a complete)
  todoToComplete(year, month, day, theEventName, theImportance, theNote, category) {
    this.addEvent(1, year, month, day, theEventName, theImportance, theNote, category);
    this.deleteEvent(0, year, month, day, theEventName, theImportance, theNote, category);
  }

  //moves completed task to todo task (deletes the comlete and creates a todo)
  completeToTodo(year, month, day, theEventName, theImportance, theNote, category) { 
    this.addEvent(0, year, month, day, theEventName, theImportance, theNote, category);
    this.deleteEvent(1, year, month, day, theEventName, theImportance, theNote, category);
  }

  // deletes an event from todo or completed list(and all empty branches)
  deleteEvent(theTask, year, month, day, theEventName, theImportance, theNote, category) {
    //determines the list to delete from
    let task;
    if(theTask == 0){task=this.#todo}
    else{task=this.#completed}

    //takes the array of events in the day
    let dayArr = task[year][month][day]
    for (let i = 0; i < dayArr.length; i++) {
      //finds location of event to delete
      if (theEventName === dayArr[i].eventName && theImportance === dayArr[i].importance && theNote === dayArr[i].note && category === dayArr[i].category) {

        //deletes event
        task[year][month][day].splice(i, 1)

        //if the day is now empty delete the day
        if (task[year][month][day].length === 0) {
          delete task[year][month][day]
          
          //if the month is now empty delete the month
          if (Object.keys(task[year][month]).length === 0) {
            delete task[year][month]
            
            //if the year is now empty delete the year
            if (Object.keys(task[year]).length === 0) {
              delete task[year]
            }
          }
        }
      }
    }

    //updates the local storage
    localStorage.setItem("todos", JSON.stringify(this.#todo));
    localStorage.setItem("completed", JSON.stringify(this.#completed));

    //updates todo and completed list visual
    Calendar.filtered.completeButtonState--;
    Calendar.filterImportance(1)
    Calendar.filtered.todoButtonState--;
    Calendar.filterImportance(0)
  }

  //adds an event to todo or completed
  addEvent(theTask, year, month, day, theEventName, theImportance, theNote, category) {   
    //adds Event to either todo or completed list
    let task;
    if(theTask == 0){task=this.#todo}
    else{task=this.#completed}
    
    //condenses the event parameters
    const event = {
      eventName: theEventName,
      importance: theImportance,
      note: theNote,
      category: category
    }
    if (year === undefined || month === undefined || day === undefined) { return }
    if (task[year] === undefined) { //checks if year exists
      this.NewEventDate(task, year, month, day, 0) //creates the year
    }
    else if (task[year][month] === undefined) { //checks if month exists
      this.NewEventDate(task, year, month, day, 1) //creates the month
    }
    else if (task[year][month][day] === undefined) { //checks if day exists
      this.NewEventDate(task, year, month, day, 2) //creates the day
    }
    for (let i = 0; i < task[year][month][day].length; i++) { //checks if event already exists (will not store duplicate events)
      if (theEventName === task[year][month][day][i].eventName && theImportance === task[year][month][day][i].importance && theNote === task[year][month][day][i].note && category === task[year][month][day][i].category) {
        return;
      }
    }
    task[year][month][day].push(event)

    //updates the local storage
    localStorage.setItem("todos", JSON.stringify(this.#todo));
    localStorage.setItem("completed", JSON.stringify(this.#completed));
  }

  //creates a new date for todo or complete (creates a place to store an event value)
  NewEventDate(task, year, month, day, theAdd) {
    switch (theAdd) {
      case 0:
        task[year] = { [month]: { [day]: [] } } //creates new year, month and day
        break;
      case 1:
        task[year][month] = { [day]: [] } //creates new month and day
        break;
      case 2:
        task[year][month][day] = [] //creates new day
        break;
    }
  }

  //returns all events with same inputted level of importance
  importanceSearch(theImportance, task) {
    let events = this.getEvents(task);
    //stores the filtered events
    let filtered = [];

    //linear searches every event and adds it to the filtered list
    for (let i = 0; i < events.length; i++) {
      if (events[i][3][0].importance === theImportance) {
        filtered.push(events[i])
      }
    }
    return filtered
  }

  //returns all events with same inputted category
  categorySearch(theCategory, task) {
    let events = this.getEvents(task);
    //stores the filtered events
    let filtered = [];

    //linear searches every event and adds it to the filtered list
    for (let i = 0; i < events.length; i++) {
      if (events[i][3][0].category === theCategory) {
        filtered.push(events[i])
      }
    }
    return filtered
  }

  //returns all events in a given list (todo or completed) as a 2D array in the format [month, day, year, {event}] 
  getEvents(task) {
    //determines the listType (todo or complete) to get events from
    let list;
    if (task === 0) {
      list = this.#todo;
    } else {
      list = this.#completed
    }

    let totalEvents = [];
    const years = Object.keys(list)
    //for every year get every month
    for (let j = 0; j < years.length; j++) { 
      const months = Object.keys(list[years[j]])
      
      //for every month get every day
      for (let a = 0; a < months.length; a++) { 
        const days = Object.keys(list[years[j]][months[a]])
        
        //for every day get every event for that day
        for (let r = 0; r < days.length; r++) { 
          const events = Object.keys(list[years[j]][months[a]][days[r]])

          //get every event in the day
          for (let e = 0; e < events.length; e++) { 
            totalEvents.push(
              [months[a],
              days[r],
              years[j],
              [list[years[j]][months[a]][days[r]][events[e]]]])
          }
        }
      }
    }
    return totalEvents
  }

  //returns all events in a given month
  getEventsMonth(month, year) {
    //finds every event
    const events = this.getEvents(0)
    const list = [];

    //linear searches for every event with the same month and year given
    for (let i = 0; i < events.length; i++) {
      if (events[i][0] == month && events[i][2] == year) {
        list.push(events[i])
      }
    }
    return list;
  }

  //returns todo list
  get todo() {
    return this.#todo;
  }

  //returns completed list
  get completed() {
    return this.#completed;
  }
}

//Used to create months for the calendar class
class Month {
  //Create date object for todays date
  static CURRENTDATE = new Date();

  //delcare the month, year, date object, and starting weekday
  constructor(theYear, theMonth) {
    this.month = theMonth;
    this.year = theYear;
    this.calendar = new Date(theYear, theMonth);
    this.startWeekday = this.calendar.getDay();
  }

  //return starting day of the month
  startDay() {
    return this.calendar.getDay();
  }

   //return all dates shown on the calendar of the current month (ie. 29...31 - 1...31 - 1...7)
  getCalendarDates() {
    //days before starting month
    let beforeWeek = Month.getTotalDays(this.month - 1, this.year) 
    let dates = [];
    let monthCounter = 1;
    let counter = this.startWeekday
    
    //fills in numbers for 6 by 7 calendar grid
    for (let i = 0; i < 42; i++) { 
      if (counter <= 0) {
        dates.push(monthCounter)
        monthCounter++;
        if (monthCounter === Month.getTotalDays(this.month, this.year) + 1) { monthCounter = 1 } //reset counter
      } else {
        dates.push(beforeWeek - counter + 1)
        counter--
      }
    }
    return dates;
  }

  //return total number of days in the month
  static getTotalDays(theMonth, theYear) { 
    const totalDates = new Date(theYear, theMonth + 1, 0);
    return totalDates.getDate();
  }

  //Determines if the date on the calendar is part of the month shown or previous/furture months
  static findMonthOfDay(day, month, location) { //location is grid number
    //if the location is less and the value is more than the center of the calendar then it is last month
    if (day > 15 && location < 7) {
      return month - 1;
    }
    //if the location is more and the value is less than the center of the calendar then it is next month 
    else if (day < 15 && location > 20) {
      return month + 1;
    } else {
      return month;
    }
  }

  //returns the name of the month given a numbered month value and year (ie. 3, 2022)
  static getMonthName(month, year) { //return name of numbered month (ie. 0="January")
    let date = new Date(year, month).getMonth(); //determines out of range date
    let monthName = ["January", "Febuary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return monthName[date];
  }

  //gets exact year date for months greater than 12 and less than -1
  static getTheYear(month, year) { 
    let date = new Date(year, month) //determines out of range date
    return date.getFullYear()
  }

  //gets the exact month date for months greater than 12 and less than -1
  static getTheMonth(month, year) {
    let date = new Date(year, month) //determines out of range date
    return date.getMonth()
  }
}

//Creates new calendar object to fill in HTML Calendar
class Calendar {
  //creates new events class for calendar (event storage)
  static CALENDAREVENTS = new Events();

  //the starting month of the current calendar date
  static startMonth;

  //creates a month class for current calendar date
  static newMonth;
  
  //stores the day selected by the user
  static selectedDate = [];

  //stores the date to edit selected by the user
  static modalDate = [];
  //stores which event the modal is in (todo or complete)
  static modalCounter=0;

  //when an event is edited, stores the event information prior to change
  static editValue = [];

  //Rida comment this
  static sideOfList = 0;

  //the calendar value
  calendar;

  //helps toggle filter button value
  static filtered = {
    //stores the todolist tabs events for importance filter
    todoEventState: Calendar.CALENDAREVENTS.getEvents(0),
    //stores state of the importance search button for todolist
    todoButtonState: 1,

    //stores the completelist tabs events importance filter
    completeEventState: Calendar.CALENDAREVENTS.getEvents(1),
    //stores state of the category search button for completedlist
    completeButtonState: 1,

    //stores the todolist tabs events for category filter
    todoCategoryEventState:Calendar.CALENDAREVENTS.getEvents(0),
    //stores the completelist tabs events for category filter
    compCategoryEventState:Calendar.CALENDAREVENTS.getEvents(1),
  };

  //inizializes the the values required for the calendar
  constructor(theMonth, theYear) {
    //define starting month of the calendar
    Calendar.startMonth = theMonth;

    //define starting month into class month
    Calendar.newMonth = new Month(theYear, theMonth);

    //initialize calendar html dates
    this.calendar = Calendar.setCalendar(Calendar.newMonth.getCalendarDates(), Calendar.newMonth.month, Calendar.newMonth.year)

    //initilize importance visuals on calendar dates
    Calendar.setMonthEvents()
  }

  //jumps to a given year and month
  static jumpToDate(month, year) {
    let date = new Date(Calendar.newMonth.year, Calendar.newMonth.month)  
    
    //equation to get number of months inbetween one month and another
    Calendar.changeMonth((year - date.getFullYear()) * 12 + (month - date.getMonth()))
  }

  //changes the month displayed based on num (ie. -1 is one month to the left)  
  static changeMonth(num) {
    //if the user tries changing to a month with a negative year than there will be no change
    if(Month.getTheYear(Calendar.newMonth.month+num, Calendar.newMonth.year)<0){return}

    //updates the calendar month object
    Calendar.newMonth = new Month(Calendar.newMonth.year, Calendar.startMonth + num);
    //updates the starting month on the calendar
    Calendar.startMonth += num;

    //updates the entire calendar to changed month date
    this.calendar = Calendar.setCalendar(Calendar.newMonth.getCalendarDates(), Calendar.newMonth.month, Calendar.newMonth.year);

    //updates the calendar to display events
    Calendar.setMonthEvents()
  }

  //sets the HTML calendar (fills in the cells) (styles the cells two)
  static setCalendar(dates, month, year) {
    //dates represents all dates shown on 6 by 7 calendar
    //month is the month shown
    //year is the year shown
    
    //reset calendar items (clears calendar)
    Calendar.calendarReset()

    //title of the month
    document.getElementById('label').innerHTML = Month.getMonthName(Calendar.newMonth.month, year) + " " + Month.getTheYear(Calendar.newMonth.month, year); 
    let count = 0;
    //yay you remembered the 'let' <-- im gonna keep this, James
    for (let i = 0; i < 6; i++) { 
      for (let j = 0; j < 7; j++) {

        //fills in the calendars day cells with the dates of that month and year
        const item = document.getElementById(count);
        const cell = document.getElementById("t" + count);
        cell.setAttribute("class", "table-default item");
        item.setAttribute("class", "table-default item");
        item.innerHTML = dates[count];
        
        //cells not part of the calendar month are grayed out
        if (Month.findMonthOfDay(dates[count], month, i * 7 + j) !== month) {
          cell.setAttribute("class", "table-light disabled");
          document.getElementById(count).style.setProperty("color", "gray")
        } 

        //cells part of the month are given onlicks and are brighter
        else {
          item.setAttribute("class", "table-default");
          cell.setAttribute("class", "table-default");
          cell.setAttribute("class", "item")

          //displays the mnth, day, year of the date clicked by the user to determine which day to create an event
          cell.setAttribute("onclick", `Calendar.setInnerEventText("${dates[count]}", "${Month.getTheMonth(Month.findMonthOfDay(dates[count], month, (i * 7 + j)), Month.getTheYear(Calendar.newMonth.month, year))}", "${Month.getTheYear(Calendar.newMonth.month, year)}")`);

          //If the day cell is on the current day, month, and year then bold the day
          if(Month.CURRENTDATE.getDate() ==dates[count] && Month.CURRENTDATE.getMonth()==month && Month.CURRENTDATE.getFullYear()==year){
            document.getElementById(count).style.setProperty("font-weight", "bold")
          } else {
            document.getElementById(count).style.setProperty("font-weight", "normal")
          }
        }
        count += 1;
      }
    }
  }

  //removes all data displayed on HTML calendar (resets it)
  static calendarReset() {
    //clears every cell of colour and attributes
    for (let i = 0; i < 42; i++) {
      document.getElementById(i).innerHTML = ""
      document.getElementById("e" + i).innerHTML = "&nbsp"
      const item = document.getElementById(i);
      const cell = document.getElementById("t" + i);
      item.setAttribute("class", "table-default");
      cell.setAttribute("class", "table-default item");
      cell.onclick = null;
    }
  }

  //creates visuals on the calendar (current month) of events on specific days (ie. red ball under April 4, 2022)
  static setMonthEvents() {

    //updates calendar
    Calendar.setCalendar(Calendar.newMonth.getCalendarDates(), Calendar.newMonth.month, Calendar.newMonth.year)

    //colour of event visual
    let importanceColour;
    const year = Month.getTheYear(Calendar.startMonth, Calendar.newMonth.year)
    const month = Month.getTheMonth(Calendar.startMonth, Calendar.newMonth.year)


    let events = Calendar.CALENDAREVENTS.getEventsMonth(month, year)
    //keys of events
    const dates = [];
    for (let j = 0; j < events.length; j++) {
      dates.push(events[j])
    }

    //determines if theres an event for the month
    if (Calendar.CALENDAREVENTS.todo[year] !== undefined) {
      
      //deteremines if there is an event for the day
      if (Calendar.CALENDAREVENTS.todo[year][month] !== undefined) {

        //for the events on that day determine the importance of the events and assign a colour
        for (let i = 0; i < dates.length; i++) {
          const importance = dates[i][3][0].importance
          if (importance === "!!!") {
            //colour red
            importanceColour = "#FA897B";
          }

          else if (importance === "!!") {
            //colour yellow
            importanceColour = "#FFDD94";
          }

          else if (importance === "!") {
            //colour green
            importanceColour = "#D2FDBB"
          }
          else {
            //colour gray
            importanceColour = "#E9D3FF"
          }

          //for every cell/day on the calendar determines if there is an event on that day and adds a visual on the cell/day
          for (let j = 0; j < 42; j++) { //loops there the entire calendar
            
            //gets the day of the cell
            const calendarDates = Number(document.getElementById(j).innerHTML.substring(0, 2))

            //checks if there is an event on the day of the calendar
            if (dates[i][1] == calendarDates) {

              //if the month of the day is on the current calnedar day (ie. if its not part of the previous/next month)
              if (Month.findMonthOfDay(calendarDates, month, j) === month) {

                //adds a small coloured dot to the cell/day as an event indicator
                const dateImportance = document.createElement("div")
                dateImportance.innerHTML = '\u2b24';
                dateImportance.style.setProperty("float", "left");
                dateImportance.style.setProperty("vertical-align", "middle");
                dateImportance.style.fontSize = "small"
                dateImportance.style.setProperty("color", importanceColour);
                document.getElementById("e" + j).appendChild(dateImportance);
              }
            }
          }
        }
      }
    }
  }

  //Visually displays the selected date of the user
  static setInnerEventText(day, month, year) {
    console.log(day, 'of', month, 'of', year, 'was clicked') //consoles the date clicked
    Calendar.selectedDate = [month, day, year]
    document.getElementById("eventMonth").innerHTML = Month.getMonthName(month, year).substring(0, 3);
    document.getElementById("eventDate").innerHTML = day + ",";
    document.getElementById("eventYear").innerHTML = year;
  }

  //creates the users event
  static createEventClicked() {
    //finds the month, day, year of the selected event
    let month = Calendar.selectedDate[0]
    let day = Calendar.selectedDate[1]
    let year = Calendar.selectedDate[2]

    //finds the event, note, importance, and category inputted by the user
    let event = document.getElementById("titleTextInput").value;
    let note = document.getElementById("noteTextInput").value;
    let priority = document.getElementById("select").value;
    let category = document.getElementById("category").value;

      console.log(event)
    if(year==undefined){Calendar.generateErrorCard(0,0); return}
    else if(event==""){Calendar.generateErrorCard(1,0); return}
    //creates the event in todolist with the previous inputs
    Calendar.CALENDAREVENTS.createToDo(year, month, day, event, priority, note, category);

    //updates the calendar to display events
    Calendar.setMonthEvents()
  }

  //updates the event the user edits
  static editEventClicked() {
    //finds month, day, year of the event being edited
    let month = document.getElementById("modalTitleMonth").value
    let day = document.getElementById("modalTitleDay").value
    let year = document.getElementById("modalTitleYear").value

    //finds the event, note, importance, category, and which list its in (todo or complete) that the user wants to update
    let event = document.getElementById("titleTextInputModal").value;
    let note = document.getElementById("noteTextInputModal").value;
    let priority = document.getElementById("selectModal").value;
    let category = document.getElementById("categoryModal").value;
    let theTask = Calendar.modalCounter

    if(month==""||day==""||year==""){Calendar.generateErrorCard(0, 0, 0);return}
    else if(event==""){Calendar.generateErrorCard(1, 0, 0);return}
    document.getElementById("saveChanges").setAttribute("data-dismiss", "modal")
    Calendar.generateErrorCard(2, 1, 0)
    //deletes the event edited
    Calendar.CALENDAREVENTS.deleteEvent(Calendar.editValue[0], Calendar.editValue[1], Calendar.editValue[2], Calendar.editValue[3], Calendar.editValue[4], Calendar.editValue[5], Calendar.editValue[6], Calendar.editValue[7])

    //creates a new event in the completed or todo list 
    if(theTask==0){
      Calendar.CALENDAREVENTS.createToDo(year, month, day, event, priority, note, category);
    } else {
      Calendar.CALENDAREVENTS.createComplete(year, month, day, event, priority, note, category);
    }

    //updates the calendar to display events
    Calendar.filtered.completeButtonState--;
    Calendar.filterImportance(1)
    Calendar.filtered.todoButtonState--;
    Calendar.filterImportance(0)
  }

  //filters the events of todo or completed list by the category
  static filterCategory(listType){
    //determine which list is being filterd by category
    let list;
    let catType;
    if(listType==0){list="todoCategoryEventState";catType="categoryFilter1"}
    else{list="compCategoryEventState"; catType = "categoryFilter2"}

    //deteremines the category being selected and filtered
    const ram = document.getElementById(catType) 
    const mar = ram.options[ram.selectedIndex].text

    //for each case only display the events with the selected category
      
      /* Each case is structured like this

        1. Prints the filtered events
        2. Updates each filtered event value

      */
    switch(mar){
      case "Default":
        Calendar.printToDos(listType, Calendar.CALENDAREVENTS.getEvents(listType))
        Calendar.filtered[list] = Calendar.CALENDAREVENTS.getEvents(listType)
        break;
      case "None":
        Calendar.printToDos(listType, Calendar.CALENDAREVENTS.categorySearch(" ", listType))
        Calendar.filtered[list] = Calendar.CALENDAREVENTS.categorySearch(" ", listType)
        break;
      default:
        Calendar.printToDos(listType, Calendar.CALENDAREVENTS.categorySearch(mar, listType))
        Calendar.filtered[list] = Calendar.CALENDAREVENTS.categorySearch(mar, listType)
        break;
    }
  }

  //filters the events of todo or complete list by the importance
  static filterImportance(listType){
    //determine which list is being filterd by category
    let list;
    let listButton;
    if(listType==0){list="todoEventState"; listButton ="todoButtonState"}
    else{list="completeEventState"; listButton = "completeButtonState"}

    //resets togglable button (when the button is clicked 4 times then reset it)
    if(Calendar.filtered[listButton]===5){Calendar.filtered[listButton]=0}

    //deteremines the importance being selected and filtered
    //for each case only display the events with the selected importance (based off buttonState)
      
      /* Each case is structured like this

        1. Prints the filtered events
        2. Updates each filtered event value
        3. Change colour of button by importance level

      */
    switch(Calendar.filtered[listButton]){
      case 0:
        Calendar.printToDos(listType, Calendar.CALENDAREVENTS.getEvents(listType))
        Calendar.filtered[list] = Calendar.CALENDAREVENTS.getEvents(listType)
        document.getElementById(listButton).style.background = "#F5F5F5" //light gray
        break;
      case 1:
        Calendar.printToDos(listType, Calendar.CALENDAREVENTS.importanceSearch("", listType))
        Calendar.filtered[list] = Calendar.CALENDAREVENTS.importanceSearch("", listType)
        document.getElementById(listButton).style.background = "#E9D3FF" //gray
        break;
      case 2:
        Calendar.printToDos(listType, Calendar.CALENDAREVENTS.importanceSearch("!", listType))
        Calendar.filtered[list] = Calendar.CALENDAREVENTS.importanceSearch("!", listType)
        document.getElementById(listButton).style.background = "#D2FDBB" //green
        break;
      
      case 3:
        Calendar.printToDos(listType, Calendar.CALENDAREVENTS.importanceSearch("!!", listType))
        Calendar.filtered[list] = Calendar.CALENDAREVENTS.importanceSearch("!!", listType)
        document.getElementById(listButton).style.background = "#FFDD94" //yellow
        break;
      
      case 4:
        Calendar.printToDos(listType, Calendar.CALENDAREVENTS.importanceSearch("!!!", listType))
        Calendar.filtered[list] = Calendar.CALENDAREVENTS.importanceSearch("!!!", listType)
        document.getElementById(listButton).style.background = "#FA897B" //red
        break;
        
    }
    //updates the button state
    Calendar.filtered[listButton]++;
  }
  
  static listEvent(listType, eventName, eventDate, importance, note, category, importanceColour, month, year, dateNum) {
    // let rightList; 
    // let leftList;
    let list; 
    
    if (listType == 0){
      list = document.getElementById("todoEventsList");
    // rightList = document.getElementById("todoEventsList1");
    // leftList = document.getElementById("todoEventsList2");
    }
    else if (listType == 1){
      list = document.getElementById("completedEventsList")
      // rightList = document.getElementById("completedEventsList1")
      // leftList = document.getElementById("completedEventsList2")
    }
    
    const card = document.createElement("div");
    card.className = "card";
    //card.style = "width: 18rem";

    const body = document.createElement("div");
    body.className = "card-body";
    
    const deleteButton = document.createElement("button");
    deleteButton.className = "btn btn-outline-secondary";
    const deleteButtoni = document.createElement("i");
    deleteButtoni.className = "fa fa-close";
    deleteButtoni.style.setProperty("position", "center");
    deleteButton.style.setProperty("float", "right");
    deleteButton.style.setProperty("display", "flex");
    deleteButton.style.setProperty("justify-content", "center");
    deleteButton.style.setProperty("align-items", "center");
    
    if (listType === 0){
      deleteButton.addEventListener("click",()=>{Calendar.CALENDAREVENTS.deleteEvent(0, year, month, dateNum, eventName, importance, note, category)});
    } 

    else if (listType === 1){
      deleteButton.addEventListener("click",()=>{Calendar.CALENDAREVENTS.deleteEvent(1, year, month, dateNum, eventName, importance, note, category)});
    }
    
    deleteButton.appendChild(deleteButtoni);
    body.appendChild(deleteButton);

    
      const doneButton = document.createElement("button");
    doneButton.className = "btn btn-outline-secondary";
    const doneButtoni = document.createElement("i");
    doneButtoni.className = "fa fa-check";
    doneButton.style.setProperty("float", "right");
    doneButton.style.setProperty("display", "flex");
    doneButton.style.setProperty("justify-content", "center");
    doneButton.style.setProperty("align-items", "center");

    doneButton.appendChild(doneButtoni);
    if (listType === 0){
      doneButton.addEventListener("click",()=>{Calendar.CALENDAREVENTS.todoToComplete(year, month, dateNum, eventName, importance, note, category, importanceColour, eventDate)});
    }

    else if (listType === 1){
      doneButton.addEventListener("click",()=>{Calendar.CALENDAREVENTS.completeToTodo(year, month, dateNum, eventName, importance, note, category, importanceColour, eventDate)});
    }
    
    body.appendChild(doneButton);
    
    const editButton = document.createElement("button");
    editButton.className = "btn btn-outline-secondary";
    const editButtoni = document.createElement("i");
    editButtoni.className = "fa fa-pencil";
    editButton.style.setProperty("float", "left");
    editButton.style.setProperty("display", "flex");
    editButton.style.setProperty("justify-content", "center");
    editButton.style.setProperty("align-items", "center");
    //creates model assoicated with the button
    editButton.setAttribute("data-toggle", "modal")
    editButton.setAttribute("data-target", "#theModal")
    editButton.setAttribute("display", "flex")
    editButton.setAttribute("justify-content", "center")
    editButton.setAttribute("align-items", "center") 
    Month.getMonthName
    
    editButton.addEventListener("click",()=>{ document.getElementById("ModalLabelOuter").innerHTML = Month.getMonthName(month, year) + " " + dateNum + ", " + year;
document.getElementById("modalTitleMonth").value = month;
document.getElementById("modalTitleDay").value = dateNum;
document.getElementById("modalTitleYear").value = year;
document.getElementById("titleTextInputModal").value = eventName; 
document.getElementById("selectModal").value = importance; 
document.getElementById("categoryModal").value = category; 
document.getElementById("noteTextInputModal").value = note; 
Calendar.modalDate = [month, dateNum, year];Calendar.editValue = [listType, year, month, dateNum , eventName , importance, note, category]});
    
    editButton.appendChild(editButtoni);
    body.appendChild(editButton);
    
    const title = document.createElement("h4");
    title.className = "card-title";
    title.innerHTML = "&nbsp" + eventName;
    body.appendChild(title);

    const date = document.createElement("h6");
    date.className = "card-subtitle mb-2 text-muted";
    date.innerHTML = eventDate;
    body.appendChild(date);

    const noteText = document.createElement("p");
    noteText.className = "card-text";
    noteText.innerHTML = note;
    card.addEventListener("click", () => {body.appendChild(noteText)});

    //body.appendChild(noteText);

    card.appendChild(body);

    const footer = document.createElement("div");
    footer.className = "card-footer";
    footer.style.setProperty("background-color", importanceColour);

    const footerCategory = document.createElement("small");
    footerCategory.className = "";
    footerCategory.innerHTML = category;
    footer.appendChild(footerCategory);

    const footerImportance = document.createElement("small");
    footerImportance.className = "move-right";
    footerImportance.style.setProperty("float", "right");
    //footerImportance.style.setProperty("color", importanceColour);
    footerImportance.style.setProperty("font-weight", "bold");
    footerImportance.innerHTML = importance;
    footer.appendChild(footerImportance);


    card.appendChild(footer);
    
    list.appendChild(card);

    const empty = document.createElement("div");
    empty.style = "height: 10px";
    list.appendChild(empty)
  }

  //prints given events on todo or completed list
  static printToDos(listType, list) {
    // let list;
    Calendar.modalCounter = listType;
    if (listType == 0){
      // document.getElementById('todoEventsList1').innerHTML = '';
      // document.getElementById('todoEventsList2').innerHTML = '';
      document.getElementById('todoEventsList').innerHTML = '';
      
    // list = Calendar.CALENDAREVENTS.getEvents(0);
    }

    else if (listType == 1){
      // document.getElementById('completedEventsList1').innerHTML = '';
      // document.getElementById('completedEventsList2').innerHTML = '';
      document.getElementById('completedEventsList').innerHTML = '';
    // list = Calendar.CALENDAREVENTS.getEvents(1);
    }

    //for every event on the list deteremine the:
    //eventname
    //year of event
    //month of event
    //day of event
    //event importance
    //event notes
    //event category
    //event dates
    //importance colour (based off of importance)
    for (let i = 0; i < list.length; i++) {
      let eventName = list[i][3][0].eventName
      let year = list[i][2];
      let month = list[i][0];
      let day = list[i][1];
      let importance = list[i][3][0].importance;
      let note = list[i][3][0].note;
      let category = list[i][3][0].category;
      let eventDate = Month.getMonthName(month, year).substring(0, 3) + " " + day + ", " + year;
      let importanceColour;
      
      if (importance === "!!!") {
        //colour red
        importanceColour = "#FA897B";
      }
      else if (importance === "!!") {
        //colour yellow
        importanceColour = "#FFDD94";
      }
      else if (importance === "!") {
        //colour green
        importanceColour = "#D2FDBB"
      }
      else {
        //colour purple
        importanceColour = "#E9D3FF"
      }

      //lists the events on the listtype (todo or complete)
      if (listType === 0){
        Calendar.listEvent(0, eventName, eventDate, importance, note, category, importanceColour, month, year, day);
      }
      else if (listType === 1){
        Calendar.listEvent(1, eventName, eventDate, importance, note, category, importanceColour, month, year, day);
      }
    }  
  }

  static generateErrorCard(theError, clear, location){
    let local;
    if(location==0){local="errorModal"}
    else {local="error"}
    let message;
    if(theError==0){
      message = "select a date"
    } else if(theError==1){
      message = "enter event title"
    }
    let element = document.getElementById(local);
      while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
    let card = document.createElement("div")
    card.className = "card text-white bg-danger mb-3"
    card.innerHTML = message
    card.style.setProperty("text-align", "center")
    card.style.setProperty('background-color', "#FA897B", "important")
    
    if(clear==0){
      // card.appendChild(body)
      document.getElementById(local).appendChild(card)
    } else {
      let element = document.getElementById(local);
        while (element.firstChild) {
          element.removeChild(element.firstChild);
      }
    }
  }
}

//the following is our start condition
//declare new calendar with starting month and year
let cCoinFinancialGroup = new Calendar(Month.CURRENTDATE.getMonth(), Month.CURRENTDATE.getFullYear());

/*======================================================== */
Calendar.CALENDAREVENTS.createToDo(2022, 3, 14, "Assignment 2 Due", '!!', "Make sure to check all requirements and all methods before handing in", "Homework")
Calendar.CALENDAREVENTS.createToDo(2022, 3, 19, "Don't Forget Me", "!!!", "Gift", "Misc")
Calendar.CALENDAREVENTS.createToDo(2022, 3, 22, "Ask Mr.Ma's First Name", "!", "Apparently it starts with a 'W' ", "Interview")
Calendar.CALENDAREVENTS.createToDo(6969, 5, 9, "(;", "", "huihuihui", "Misc")
Calendar.CALENDAREVENTS.createToDo(2022, 8, 7, "Rachel's Birthday", "!", "She told me to add this. 'Hi Rida' ", "Meetup")
Calendar.CALENDAREVENTS.createToDo(1, 11 , 25 , "Jesus' Birthday", "!!!", "Pray", " ")
/*======================================================== */


//context menu
