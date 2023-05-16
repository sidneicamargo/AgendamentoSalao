const Storage = {
  get() {
    return JSON.parse(localStorage.getItem('')) || []
  },
  set(agendamentos) {
    localStorage.setItem(
      'CabeleleilaLeilaAgendamentos',
      JSON.stringify(agendamentos)
    )
  }
}

const Modal = {
  open() {
    document.querySelector('.modal-overlay').classList.add('active')
  },
  close() {
    document.querySelector('.modal-overlay').classList.remove('active')
  }
}

const ModalEdit = {
  open() {
    document.querySelector('.modal-overlay-edit').classList.add('active')
  },
  close() {
    document.querySelector('.modal-overlay-edit').classList.remove('active')
  },
  preenche(agendamento) {
    descriptionEdit = document.querySelector('input#descriptionEdit')
    amountEdit = document.querySelector('input#amountEdit')
    dateEdit = document.getElementById('dateEdit')
    timeEdit = document.getElementById('timeEdit')

    let data = agendamento.date.split(/[s, /]+/)
    let dataAmericana = `${data[2]}-${data[1]}-${data[0]}`

    descriptionEdit.value = agendamento.description
    amountEdit.value = agendamento.amount
    dateEdit.value = dataAmericana
    timeEdit.value = agendamento.time
  }
}

const Agendamento = {
  all: Storage.get(),

  add(agendamento) {
    const lastId = Agendamento.all[Agendamento.all.length - 1]?.id || 0
    agendamento.id = lastId + 1
    Agendamento.all.push(agendamento)
    App.reload()
  },

  remove(index) {
    Agendamento.all.splice(index, 1)
    App.reload()
  },

  showUpdate(id) {
    ModalEdit.open()
    const agendamento = Agendamento.all.find(agen => agen.id === id)
    agendamento.id = id
    if (!agendamento) {
      throw new Error('Agendamento não encontrado')
    }
    let form = document.querySelector('#EditForm')
    form.outerHTML = `<form id=\"EditForm\" action=\"\" onsubmit=\"Form.submitUpdate(event, ${id})\">\n
    <div class="input-group">
      <label for="description" class="sr-only">Descrição</label>
      <input type="text" id="descriptionEdit" name="descriptionEdit" placeholder="Descrição do serviço" value="${agendamento.description}">
    </div>

    <div class="input-group">
      <label for="amount" class="sr-only">Valor</label>
      <input type="number" id="amountEdit" name="amountEdit" placeholder="Valor" step="0.01" value="${agendamento.amount}">
    </div>

    <div class="input-group">
      <small class="help">Atendimentos das 09:00 às 18:00 de Segunda a Sexta-feira</small>
      <label for="date" class="sr-only">Data</label>
      <input type="date" id="dateEdit" name="dateEdit" value="${agendamento.date}">
    </div>

    <div class="input-group">
      <label for="time" class="sr-only">Horário</label>
      <input type="time" id="timeEdit" name="timeEdit" min="08:00" max="18:00" value="${agendamento.time}">
      <small class="help" id="aviso">Atendimentos devem ser marcados com 2 dias de antecedência</small>
    </div>

    <div class="input-group actions">
      <a href="#" onclick="ModalEdit.close()" class="button cancel">Cancelar</a>
      <button>Salvar</button>
    </div>
    </form>`
    ModalEdit.preenche(agendamento)
  },

  saveUpdate(agendamento, id) {
    Agendamento.all.forEach(agen => {
      if (agen.id == id) {
        agen.description = agendamento.description
        agen.amount = agendamento.amount
        agen.date = agendamento.date
        agen.time = agendamento.time
      }
    })
  },

  today() {
    let today = 0
    let hoje = new Date()

    Agendamento.all.forEach(agendamento => {
      let dataAgen = agendamento.date.split(/[s, /]+/)
      let data = new Date(dataAgen[2], dataAgen[1], dataAgen[0])
      if (data.getDate() == hoje.getDate()) {
        today++
      }
    })

    return today
  },

  week() {
    let week = 0
    let hoje = new Date()
    let diasSemana = 7 - hoje.getDay() - 1

    Agendamento.all.forEach(agendamento => {
      let dataAgen = agendamento.date.split(/[s, /]+/)
      let data = new Date(dataAgen[2], dataAgen[1] - 1, dataAgen[0])
      if (
        data.getDate() < hoje.getDate() + diasSemana &&
        hoje.getMonth() == data.getMonth() &&
        hoje.getYear() == data.getYear()
      ) {
        week++
      }
    })

    return week
  },

  total() {
    let total = 0
    let hoje = new Date()
    Agendamento.all.forEach(agendamento => {
      let dataAgen = agendamento.date.split(/[s, /]+/)

      if (Number(dataAgen[1] - 1) == Number(hoje.getMonth())) {
        total += agendamento.amount
      }
    })
    return total
  }
}

const DOM = {
  agendamentosCointainer: document.querySelector('#data-table tbody'),

  addAgendamento(agendamento, index) {
    const tr = document.createElement('tr')
    tr.innerHTML = DOM.innerHTMLAgendamento(agendamento, index)
    tr.dataset.index = index

    DOM.agendamentosCointainer.appendChild(tr)
  },

  innerHTMLAgendamento(agendamento, index) {
    const amount = Utils.formatCurrency(agendamento.amount)

    const html = `
        <td class="id">${agendamento.id}</td>
        <td class="description">${agendamento.description}</td>
        <td class="income">${amount}</td>
        <td class="date">${agendamento.date}</td>
        
        <td>
          <img onclick="Agendamento.remove(${index})" src="./images/delete.png" alt="Remover transação">
          <img onclick="Agendamento.showUpdate(${agendamento.id})" src="./images/editar.png" alt="Remover transação">
        </td>
      `
    return html
  },

  updateBalance() {
    document.getElementById('todayDisplay').innerHTML = Agendamento.today()

    document.getElementById('weekDisplay').innerHTML = Agendamento.week()

    document.getElementById('totalDisplay').innerHTML = Utils.formatCurrency(
      Agendamento.total()
    )
  },

  clearAgendamentos() {
    DOM.agendamentosCointainer.innerHTML = ''
  }
}

const Utils = {
  formatCurrency(value) {
    const signal = Number(value) < 0 ? '-' : ''
    value = String(value).replace(/\D/g, '')
    value = Number(value) / 100
    value = value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    })
    return signal + value
  },

  formatAmount(amount) {
    amount = amount * 100
    return Math.round(amount)
  },

  formatDate(date, time) {
    let splittedDate = date.split('-')

    return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]} ${time}`
  }
}

const Form = {
  description: document.querySelector('input#description'),
  amount: document.querySelector('input#amount'),
  date: document.getElementById('date'),
  time: document.getElementById('time'),

  getValues() {
    return {
      description: Form.description.value,
      amount: Form.amount.value,
      date: Form.date.value,
      time: Form.time.value
    }
  },

  descriptionEdit: document.querySelector('input#descriptionEdit'),
  amountEdit: document.querySelector('input#amountEdit'),
  dateEdit: document.getElementById('dateEdit'),
  timeEdit: document.getElementById('timeEdit'),

  getValuesEdit() {
    return {
      description: descriptionEdit.value,
      amount: amountEdit.value,
      date: dateEdit.value,
      time: timeEdit.value
    }
  },

  validateFields(x) {
    const { description, amount, date, time } =
      x != 1 ? Form.getValues() : Form.getValuesEdit()
    const today = new Date()
    const agendamento = new Date(date)

    if (
      description.trim() === '' ||
      amount.trim() === '' ||
      date.trim() === '' ||
      time.trim() === ''
    ) {
      throw new Error('Os campos não foram preenchidos')
    }

    if (
      agendamento.getDate() < today.getDate() + 2 ||
      agendamento.getDay() == 6 ||
      agendamento.getDay() == 5
    ) {
      throw new Error(
        'Agendamentos devem ser feitos com dois dias de antecêdencia, e não é possível realizar agendamentos para Sábado ou Domingo'
      )
    }
  },

  formatValues(x) {
    let { description, amount, date, time } =
      x != 1 ? Form.getValues() : Form.getValuesEdit()

    amount = Utils.formatAmount(amount)
    date = Utils.formatDate(date, time)

    return {
      description: description,
      amount: amount,
      date: date,
      time: time
    }
  },

  saveAgendamento(agendamento) {
    Agendamento.add(agendamento)
  },

  clearFields() {
    Form.description.value = ''
    Form.date.value = ''
    Form.time.value = ''
    Form.amount.value = ''
    //EDIT
    Form.descriptionEdit.value = ''
    Form.dateEdit.value = ''
    Form.timeEdit.value = ''
    Form.amountEdit.value = ''
  },

  submit(event) {
    event.preventDefault()
    try {
      Form.validateFields()

      const agendamento = Form.formatValues()

      Form.saveAgendamento(agendamento)

      Form.clearFields()

      Modal.close()
    } catch (error) {
      alert(error.message)
    }
  },

  submitUpdate(event, id) {
    event.preventDefault()
    try {
      Form.validateFields(1)

      const agendamento = Form.formatValues(1)

      Agendamento.saveUpdate(agendamento, id)

      Form.clearFields()

      ModalEdit.close()

      App.reload()
    } catch (error) {
      alert(error.message)
    }
  }
}

const App = {
  init() {
    Agendamento.all.forEach(function (agendamento, index) {
      DOM.addAgendamento(agendamento, index)
    })
    DOM.updateBalance()
    Storage.set(Agendamento.all)
  },
  reload() {
    DOM.clearAgendamentos()
    App.init()
  }
}

App.init()
