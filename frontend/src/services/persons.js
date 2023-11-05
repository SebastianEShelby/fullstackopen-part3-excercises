import axios from 'axios';

const baseUrl = '/api/persons'

const getAll = () => axios.get(baseUrl)

const create = (newObject) => axios.post(baseUrl, newObject)

const deleteOne = id => axios.delete(`${baseUrl}/${id}`)

const update = (id, newObject) => axios.put(`${baseUrl}/${id}`, newObject)

export default { getAll, create, deleteOne, update }