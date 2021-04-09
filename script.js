const Modal = {
    toggle() {
        // Abrir modal
        // Adrionar a class active ao modal
        document.querySelector(".modal-overlay")
        .classList
        .toggle("active");
    },
    close() {
        document.querySelector(".modal-overlay")
        .classList
        .remove("active")

    }
}

const Storage = {
    get() {
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
    },
    set(transactions) {
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions))
    }
}

const Transaction = {
    all: Storage.get(),

    add(transaction){
        Transaction.all.push(transaction)

        App.reload();
    },
    remove(index) {
        Transaction.all.splice(index, 1)

        App.reload();
    },

    incomes() {
        let income = 0;
        // pegar todas as transações 
        // para cada transacao
        Transaction.all.forEach(transaction => {
        // se a transacao é maior que zero
        if( transaction.amount > 0 )
        // somar a uma variável e retornar a variável
        income += transaction.amount;
        })
        return income
    },

    expenses() {
        let expense = 0;
        // pegar todas as transações 
        // para cada transacao
        Transaction.all.forEach(transaction => {
        // se a transacao é maior que zero
        if( transaction.amount < 0 )
        // somar a uma variável e retornar a variável
        expense += transaction.amount;
        })
        return expense
    },

    total() {
        totalValue = Transaction.incomes() + Transaction.expenses()
        return totalValue
    },

    

    
}

const DOM = {
    transactionsContainer: document.querySelector('#data-table tbody'),
    addTransaction(transaction, index) {
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
        tr.dataset.index = index

        DOM.transactionsContainer.appendChild(tr);

    },

    innerHTMLTransaction(transaction, index) {
        const CSSclass = transaction.amount > 0 ? "income" : "expense"

        const amount = Utils.formatCurrency(transaction.amount);

        const html = `
            <td class="description">${transaction.description}</td>
            <td class=${CSSclass}>${amount}</td>
            <td class="date">${transaction.date}</td>
            <td>
                <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover Transação">
            </td>
        `
        return html
    },

    updateBalance() {
        document.getElementById('income-display')
        .innerHTML = Utils.formatCurrency(Transaction.incomes());
        document.getElementById('expense-display')
        .innerHTML = Utils.formatCurrency(Transaction.expenses());
        document.getElementById('total-display')
        .innerHTML = Utils.formatCurrency(Transaction.total());
    },

    clearTransactions() {
        DOM.transactionsContainer.innerHTML = "";
    }
}

const Utils = {

    formatAmount(value) {
        value = value * 100
        
        return Math.round(value)
    },

    formatDate(value) {
        const splittedDate = value.split("-")
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },

    formatCurrency(value) {
        const signal = Number(value) < 0 ? "-" : ""

        value = String(value).replace(/\D/g, "")

        value = Number(value) / 100

        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })

        return signal + value;
    }
}

const Form = {

    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    getValues() {
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },
    
    // verificar se todas as informacoes foram preenchidas
    validateFields() {
        const { description, amount, date } = Form.getValues()

        if(description.trim() === "" || 
            amount.trim() === "" ||
            date.trim() === "" ) {
                throw new Error("Por favor, preencha todos os campos")
            }
    },

    formatValues() {
        let { description, amount, date } = Form.getValues()
        amount = Utils.formatAmount(amount)
        date = Utils.formatDate(date)

        return {
            description,
            amount,
            date
        }
    },

    clearFields() {
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },


    submit(event) {
        event .preventDefault();


        try {
            // valiadar se todos os campos foram preenchidos
            Form.validateFields();
            // formatar os dados para salvar
            const transaction = Form.formatValues();
            // salvar
            Transaction.add(transaction)
            // apagar os dados do formulário
            Form.clearFields()
            // Fechar Modal
            Modal.close()
            
        } catch (error) {
            alert(error.message);
        }
        

        
    }
}


const Animations = {
    negativeAccount() {
        // seleciona o card total
        const cardTotal = document.getElementById('card-total')

        // console.log(Transaction.total())

        if( Transaction.total() < 0 ) {
            cardTotal.style.background = "#E92929"
            // cardTotal.style.opacity = 0.5;
        } else {
            cardTotal.style.background = "#49AA26"
    }
    },

    hideValues() {
        document.querySelector("#income-display").innerHTML = "$"
        document.querySelector("#expense-display").innerHTML = "$"
        document.querySelector("#total-display").innerHTML = "$"

        document.querySelector("#sub-menu .eye").classList.remove("active");
        document.querySelector("#sub-menu .eye-off").classList.add("active");


        const incomeList = document.querySelectorAll(".income")
        const expenseList = document.querySelectorAll(".expense")

        const arrayExpenseList = Array.from(expenseList)
        arrayExpenseList.forEach(item => {
            item.classList.add("inactive")
        })

        const arrayIncomeList = Array.from(incomeList);

        arrayIncomeList.forEach(item => {
            item.classList.add("inactive")
        })
    },

    showValues() {
        DOM.updateBalance();
        document.querySelector("#sub-menu .eye-off").classList.remove("active");
        document.querySelector("#sub-menu .eye").classList.add("active");

        const incomeList = document.querySelectorAll(".income")
        const expenseList = document.querySelectorAll(".expense")

        const arrayExpenseList = Array.from(expenseList)
        arrayExpenseList.forEach(item => {
            item.classList.remove("inactive")
        })

        const arrayIncomeList = Array.from(incomeList);

        arrayIncomeList.forEach(item => {
            item.classList.remove("inactive")
        })

        


    }
}

const App = {
    init() {
        Transaction.all.forEach((transaction, index) => {
            DOM.addTransaction(transaction, index);
        }) 
        
        DOM.updateBalance();
        Animations.negativeAccount();
        // Animations.hideValues();

        Storage.set(Transaction.all)
    },
    reload() {
        DOM.clearTransactions();
        Animations.negativeAccount();
        App.init();

    },
}


App.init()
