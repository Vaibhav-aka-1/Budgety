//Budget Calculate module.

var budgetController = (function(){

    var Income = function(id,description,value){
        this.id = id;
        this.description = description;
        this.value = value;
    };
    var Expense = function(id,description,value){
        this.id = id;
        this.value = value;
        this.description = description;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(totalIncome){
        if(totalIncome > 0){
            this.percentage = Math.round((this.value/totalIncome)*100);
        }else{
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function(){
        return this.percentage;
    }

    var calculateTotal = function(type){
        var sum = 0;

        data.allItems[type].forEach(function(cur){
            sum += cur.value;
        });
        data.totals[type] = sum;
    }

    var data = {
        allItems : {
            inc : [],
            exp : [],
        },
        totals : {
            inc : 0,
            exp : 0
        },
        budget : 0,
        percentage : 0
    }
    return {
        addItem : function(type,des,val){
            var newItem , ID;

            //Creating unique Id;
            if(data.allItems[type].length > 0){
                ID = data.allItems[type][data.allItems[type].length -1].id + 1;
            }else{
                ID = 0;
            }

            //Creating new item based on 'inc' or 'dec'
            if(type === 'inc'){
                newItem = new Income(ID,des,val);
            }
            else if(type === 'exp'){
                newItem = new Expense(ID,des,val);
            }
            //pusing the new item to our data-structure.

            data.allItems[type].push(newItem);
            return newItem;
        },

        deleteItem : function(type , id){
            var ids,index;

            //we need array of ids from our inc and exp arrays
            // ids = [1,3,5,6,8]

            ids = data.allItems[type].map(function(current){
                 return current.id;
            });

            index = ids.indexOf(id);

            if(index !== -1){
                data.allItems[type].splice(index,1);
            }



        },

        calculateBudget : function(){
            //1.Calculate the total income and total Expenses
            calculateTotal('exp');
            calculateTotal('inc');
            //2.Calculate the total buget
            data.budget = data.totals.inc - data.totals.exp;

            //3. Calaulate the percentage : of money spend from income in Expenses.
            if(data.totals.inc > 0){
            data.percentage = Math.round((data.totals.exp / data.totals.inc)*100);
            }else{
                data.percentage = -1;
            }
        },

        calculatePercentages : function(){
            data.allItems.exp.forEach(function(cur){
                cur.calcPercentage(data.totals.inc);
            });

        },

        getPercentages : function(){
            var allPerc  = data.allItems.exp.map(function(cur){
                return cur.getPercentage();
            });
            return allPerc;
        },

        getBudget : function(){
            return{
                percentage : data.percentage,
                totalInc : data.totals.inc,
                totalExp : data.totals.exp,
                budget : data.budget

            }
        },


        testing : function(){
            console.log(data);
     }   
    }

})();

///////////////////////////////////////////////////////////////////////UI module.

var UIController = (function(){

    var DOMstrings = {
        inputType : '.add__type',
        inputDescription : '.add__description',
        inputValue : '.add__value',
        inputBtn : '.add__btn',
        incomeContainer : '.income__list',
        expensesContainer : '.expenses__list',
        budgetLabel : '.budget__value',
        incomeLabel : '.budget__income--value',
        expensesLabel : '.budget__expenses--value',
        percentageLabel : '.budget__expenses--percentage',
        container : '.container',
        expensesPercentageLabel : '.item__percentage',
        dateLabel : '.budget__title--month'
    };

    var formatNumber = function(num , type){
        var int,dec,numsplit;

        num = Math.abs(num);
        num = num.toFixed(2);

        numsplit = num.split('.');
        int = numsplit[0];
        if(int.length > 3){
            int = int.substr(0 , int.length-3) + ',' + int.substr(int.length-3 , 3);
        }
        dec = numsplit[1];

        return (type === 'exp'? '-' : '+') + ' ' +int +'.' + dec ;
    };
    return{
         getInput : function(){
            return{
                type : document.querySelector(DOMstrings.inputType).value,
                description : document.querySelector(DOMstrings.inputDescription).value,
                value : parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },
        addListItem : function(obj , type){
            var html,newhtml,element;

            //creating html string with placeholde text
            if(type === 'inc'){
                element = DOMstrings.incomeContainer;
                html = ' <div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div> </div>'
            }
            else if(type === 'exp'){
                element = DOMstrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"> <div class="item__description">%description%</div><div class="right clearfix"> <div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div> </div></div>'
            }
            
            //Replacing the placeholder text with some actual text
            newhtml = html.replace('%id%',obj.id);
            newhtml = newhtml.replace('%description%',obj.description);
            newhtml  = newhtml.replace('%value%',formatNumber(obj.value , type));

            //Insert the html into DOM.
            document.querySelector(element).insertAdjacentHTML('beforeend',newhtml);
        },
        clearFields : function(){
            var field,fieldArr ;

            field = document.querySelectorAll(DOMstrings.inputDescription + ',' + DOMstrings.inputValue);
            fieldArr = Array.prototype.slice.call(field);

            fieldArr.forEach(function(current , index , array){
                current.value = "";
                fieldArr[0].focus(); 
            });
        },

        displayBudget : function(obj){
            var type;
            obj.budget > 0? type = 'inc' : type = 'exp';
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget , type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc,type);
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp,type);
            

            if(obj.percentage > 0){
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            }else{
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }
        },

        

        deleteListItem : function(selectorID){
            var el;

            el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },

        displayPercentages : function(percentages){
            var fields = document.querySelectorAll(DOMstrings.expensesPercentageLabel);

            var nodeListFOrEach = function(list , callback){
                for(var i =0 ; i<list.length ; i++){
                    callback(list[i] , i);
                }
            }

            nodeListFOrEach(fields , function(current , index){
                if(percentages[index] > 0){
                    current.textContent = percentages[index] + '%';
                }else{
                    current.textContent = '---';
                }

            })
        },
        displayMonth : function(){
            var year, now , month ,months ;
            now = new Date();
            year = now.getFullYear();
            month = now.getMonth();
            months = ['Jan' , 'Feb' , 'Mar' , 'Apr' , 'May' , 'Jun' , 'Jul' , 'Aug' , 'Sep' , 'Oct' , 'Nov', 'Dec'];
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' +year;
        },


        getDOMStrings : function(){
            return DOMstrings;
        }
    };

})();


////////////////////////////////////////////////////////////Global app Controller Module

var Controller = (function(budgetCtrl,UICtrl){
   
    var setUpEventListeners = function(){
        var DOM = UICtrl.getDOMStrings();

        document.querySelector(DOM.inputBtn).addEventListener('click',ctrlAddItem);
        document.addEventListener('keypress',function(event){
       if(event.which === 13 || event.keyCode === 13){
           ctrlAddItem();
       }
     });
        document.querySelector(DOM.container).addEventListener('click' , ctrlDeleteItem);
    };

    var updateBudget = function(){
        //1. Calculate the budget.
        budgetCtrl.calculateBudget();
        //2. return the budget.
        var budget = budgetCtrl.getBudget();
        //3. Display the budget on the UI.
        //console.log(budget);     
        UICtrl.displayBudget(budget);
    };

    var updatePercentage = function(){

        //1. caluculate percentages.
        budgetCtrl.calculatePercentages();
        //2. read precentage from budget controller.
        var percentages = budgetCtrl.getPercentages();
        //3. update the UI with the new percentage.
        UICtrl.displayPercentages(percentages);

    };

    var ctrlAddItem = function(){
        var input,newItem ;
        //1. get the field input data.
        input = UICtrl.getInput();

        if(input.description != "" && !isNaN(input.value) && input.value > 0){
            //2. Add the item to budget.
            newItem = budgetCtrl.addItem(input.type , input.description , input.value);
            
            //3. Add the item to UI.
            UICtrl.addListItem(newItem , input.type);

            //4. Remove previous values
            UICtrl.clearFields();
        }  
        
        updateBudget();

        updatePercentage();
        
        
    };

    var ctrlDeleteItem = function(event){
        var itemID,splitID,value,ID;

        itemID =  event.target.parentNode.parentNode.parentNode.parentNode.id;

        if(itemID){
            splitID = itemID.split('-');
            value = splitID[0];
            ID = parseInt(splitID[1]);

            //1. Delete the item form data-structure.

            budgetCtrl.deleteItem(value,ID);

            //2.Delete the item from UI.

            UICtrl.deleteListItem(itemID);

            //3.update the budget.

            updateBudget();

        }
    }

    return {
        init : function(){
            console.log('yey! the web-site has start working. ');
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                percentage : -1,
                totalInc : 0,
                totalExp : 0,
                budget : 0

            });
            setUpEventListeners();
        }
    }

})(budgetController,UIController);

Controller.init();