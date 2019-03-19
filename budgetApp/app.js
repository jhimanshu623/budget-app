var budgetController = (function () {
    class Expense {
        constructor(id, description, value) {
            this.id = id;
            this.description = description;
            this.value = value,
                this.percentage = -1;
        }
    };
    Expense.prototype.calcPercentage = function (income) {
        if (income > 0) {
            this.percentage = Math.round((this.value / income) * 100);
        }
        else {
            this.percentage = -1;
        }
    }
    class Income
     {
        constructor(id, description, value) 
        {
            this.id = id;
            this.description = description;
            this.value = value;
        }
    }
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };
    var calculateTotal = function (type) {
        var sum = 0;
        data.allItems[type].forEach(cur => {
            sum += cur.value;
        });
        data.totals[type] = sum;
    }
    return {
        addItem: function (type, desc, val) {
            var newItem, Id;
            if (data.allItems[type].length > 0) {
                Id = data.allItems[type][data.allItems[type].length - 1].id + 1;
            }
            else {
                Id = 0;
            }
            if (type === 'exp') {
                newItem = new Expense(Id, desc, val);
            }
            else if (type === 'inc') {
                newItem = new Income(Id, desc, val);
            }
            data.allItems[type].push(newItem);
            return newItem;
        },
        deleteItem: function (type, id) {
            ids = data.allItems[type].map(current => {
                return current.id;
            })
            indx = ids.indexOf(id);
            data.allItems[type].splice(indx, 1);
        },
        calculateBudget: function () {
            //calculate the total income and expenses
            calculateTotal('inc');
            calculateTotal('exp');
            //calculate the budget:income-expense
            data.budget = data.totals.inc - data.totals.exp;
            //claculate the percentage of income that we spent
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            }
            else {
                data.percentage = -1;
            }

        },
        calculatePercentage: function () {
            data.allItems.exp.forEach(current => {
                current.calcPercentage(data.totals.inc);
            });
        },
        getPercentage: function () {
            var percentages;
            percentages = data.allItems.exp.map(current => {
                return current.percentage;
            });
            return percentages;
        },
        getBudget: function () {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            } 
        }
    }
})();

var UIController = (function () {
    var DomStrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        exppercentage: '.item__percentage',
        date: '.budget__title--month'
    };
    var formatNumber = function (num, type) {
        var numSplit, int, dec;
        num = Math.abs(num);
        num = num.toFixed(2);
        numSplit = num.split('.');
        int = numSplit[0];
        if (int.length > 3)
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        dec = numSplit[1];
        return (type === 'exp' ? '-' : '+') + int + '.' + dec;
    }
    return {
        getinput: function () {
            return {
                type: document.querySelector(DomStrings.inputType).value,  //will be either inc or exp
                description: document.querySelector(DomStrings.inputDescription).value,
                value: parseFloat(document.querySelector(DomStrings.inputValue).value)
            }
        },
        addListItem: function (obj, type) {
            var html, newHtml, element;
            //create html string swith placeholder text
            if (type === 'inc') {
                element = DomStrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%desc%</div><div class="right clearfix"><div class="item__value">%val%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
            else if (type === 'exp') {
                element = DomStrings.expenseContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%desc%</div><div class="right clearfix"><div class="item__value">%val%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
            //replace placeholder text eith some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%desc%', obj.description);
            newHtml = newHtml.replace('%val%', formatNumber(obj.value, type));

            //insert the html into dom
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },
        deleteListItem: function (selectorId) {
            var el;
            el = document.getElementById(selectorId);
            el.parentNode.removeChild(el);
        },
        clearFields: function () {
            var fields;//,fieldsArr;
            fields = document.querySelectorAll(DomStrings.inputDescription + ',' + DomStrings.inputValue);
            // fieldsArr=Array.prototype.slice.call(fields);
            fields.forEach(current => {
                current.value = "";
            });
            fields[0].focus();
        },
        getDOM: function () {
            return DomStrings;
        },
        displayBudget: function (obj) {
            var type;
            type = obj.budget > 0 ? 'inc' : 'exp';
            document.querySelector(DomStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DomStrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DomStrings.expenseLabel).textContent = formatNumber(obj.totalExp, 'exp');
            if (obj.totalInc > 0) {
                document.querySelector(DomStrings.percentageLabel).textContent = obj.percentage + '%';
            }
            else {
                document.querySelector(DomStrings.percentageLabel).textContent = '---';
            }
        },
        displaypercentage: function (percentage) {
            var fields = document.querySelectorAll(DomStrings.exppercentage);
            fields.forEach((current, index) => {
                if (percentage[index] > 0) {
                    current.textContent = percentage[index];
                }
                else {
                    current.textContent = '---';
                }
            });
        },
       // formatNumber: function (num, type) {
       //     var numSplit, int, dec;
       //     num = Math.abs(num);
       //     num = num.toFixed(2);
       //     numSplit = num.split('.');
       //     int = numSplit[0];
       //     dec = numSplit[1];
       // },
        displayDate: function () {
            var now, year, month, months;
            now = new Date();
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            year = now.getFullYear();
            month = now.getMonth();
            document.querySelector(DomStrings.date).textContent = months[month] + " " + year;
        },
        changeState: function () {
            var fields = document.querySelectorAll(DomStrings.inputType + ',' + DomStrings.inputDescription + ',' + DomStrings.inputValue);
            fields.forEach(current => {
                current.classList.toggle('red-focus');
            });
            document.querySelector(DomStrings.inputBtn).classList.toggle('red');
        }
    }
})();

var controller = (function (budgetCtrl, UICtrl) {
    var setUpEventListeners = function () {
        var DOM = UICtrl.getDOM();
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
        document.addEventListener('keypress', function (event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });
        document.querySelector(DOM.container).addEventListener('click', ctrlDelItem);
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changeState);
    }
    var updateBudget = function () {
        //1.claculate the budget
        budgetCtrl.calculateBudget();
        //2. return the budget
        var budget = budgetController.getBudget();
        //3. display the budget on the ui
        UIController.displayBudget(budget);
    }
    var updatepercentages = function () {
        //1.claculate the percentage
        budgetCtrl.calculatePercentage();
        //2. return the percentage
        var percentage = budgetCtrl.getPercentage();
        //3. display the percentage on the ui
        UICtrl.displaypercentage(percentage);
    }
    var ctrlAddItem = function () {
        var input, newItem;


        //1.get the field input data
        input = UICtrl.getinput();
        if (input.description != "" && !isNaN(input.value) && input.value > 0) {
            //2. add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            //3.add the item to the ui
            UICtrl.addListItem(newItem, input.type);

            //4.clear the input fields
            UICtrl.clearFields();

            //5. update the budget
            updateBudget();

            //6. claculate and update the percenteages
            updatepercentages();
        }
    }
    var ctrlDelItem = function (event) {
        var itemId, splitId, type, Id;
        itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if (itemId) {
            splitId = itemId.split('-');
            type = splitId[0];
            Id = parseInt(splitId[1]);

            //1. delete the item from the database
            budgetCtrl.deleteItem(type, Id);

            //2. delete the item from the ui
            UICtrl.deleteListItem(itemId);

            //3. update and show the new budget
            updateBudget();

            //4. claculate and update the percenteages
            updatepercentages();
        }
    }
    return {
        init: function () {
            setUpEventListeners();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            UICtrl.displayDate();
        }
    }
})(budgetController, UIController);


controller.init();