const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const { v4: uuidv4 } = require('uuid');

const app = express()

app.use(express.json())
app.use(cors())
app.use(express.static('dist'))

let personss =[
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]
morgan.token('postData', (req) => {
    if (req.method === 'POST') {
        return JSON.stringify(req.body);
    }
    return '-';
});

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :postData'));

app.get('/',(request,response) =>{
    response.end("Hello world")
})
app.get('/api/persons',(request,response) =>{
    response.json(personss)
})
app.get('/info',(request,response) =>{
    const req = new Date().toUTCString()
    const info = `Phonebook has info for ${personss.length} people` 
    response.send(`
            <div>
                <h1>${info}</h1>
                <p>Request received at: ${req}</p>
            <div>
    `);
})
app.get('/api/persons/:id',(request,response)=>{
    const id = Number(request.params.id)
    const person = personss.find(person => person.id === id )
    if(person){
        response.json(person)
    }else{
        response.status(404).end()
    }
   
})
app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id);
    personss = personss.filter(person => person.id !== id);
    response.status(204).end();
  });
  
app.post('/api/persons',(request,response)=>{
   const person = request.body
    if(!person.name || !person.number){
        return response.status(404).json({error:'Both name and number are required'})
    }
   if(personss.some(p => p.name === person.name)){
    return response.status(404).json({error:'Name must be unique'})
   }
   console.log(`POST request received successfully!`, request.body)
 const id = uuidv4()

   const newObj={
    id,
    name:person.name,
    number:person.number
   }
   personss = personss.concat(newObj)

   response.status(201).json(newObj)
   
})
const PORT = process.env.PORT || 3001
app.listen(PORT,()=>{
    console.log(`Started on port ${PORT}`)
})