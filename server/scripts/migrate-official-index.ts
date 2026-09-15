import mongoose from 'mongoose'
import { connectDB } from '../db'
import { Official } from '../modules/official/service'

const run = async () => {
 await connectDB()

 const indexes = await Official.collection.indexes()
 if (indexes.some((index) => index.name === 'id_1')) {
  await Official.collection.dropIndex('id_1')
  console.log('Dropped legacy id_1 index')
 }

 if (indexes.some((index) => index.name === 'objectUuId_1')) {
  await Official.collection.dropIndex('objectUuId_1')
  console.log('Dropped existing objectUuId_1 index')
 }

 await Official.collection.createIndex(
  { objectUuId: 1 },
  { name: 'objectUuId_1', unique: true, sparse: true },
 )
 console.log('Created objectUuId_1 index')
}

run()
 .catch((error) => {
  console.error('Official index migration failed:', error)
  process.exitCode = 1
 })
 .finally(async () => {
  await mongoose.disconnect()
 })
