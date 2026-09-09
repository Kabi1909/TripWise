// In-memory model adapter used only by tests and the isolated browser preview.
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const models = Object.fromEntries(['User', 'Booking', 'Message', 'History', 'OAuthAttempt'].map(name => [name, require('../models/' + name)]));
const ids = { agent: '100000000000000000000001', traveler: '100000000000000000000002',
  otherAgent: '100000000000000000000003', otherTraveler: '100000000000000000000004', booking: '200000000000000000000001' };
function installFixtures() {
  const stores = Object.fromEntries(Object.keys(models).map(name => [name, []]));
  const originals = [];
  function match(document, filter) {
    return Object.entries(filter).every(([key, value]) => {
      if (key === '$or') return value.some(part => match(document, part));
      const actual = document[key];
      if (value && typeof value === 'object' && !(value instanceof mongoose.Types.ObjectId) && !(value instanceof Date)) {
        if ('$exists' in value) return (actual !== undefined && actual !== null) === value.$exists;
        if ('$gt' in value) return actual > value.$gt;
      }
      return String(actual) === String(value);
    });
  }
  function query(value) {
    const result = {
      value,
      sort(spec) { if (Array.isArray(this.value)) { const [key, order] = Object.entries(spec)[0]; this.value.sort((a, b) => a[key] > b[key] ? order : -order); } return this; },
      limit(count) { if (Array.isArray(this.value)) this.value = this.value.slice(0, count); return this; },
      select() { return this; },
      lean() { this.value = Array.isArray(this.value) ? this.value.map(d => d.toObject()) : this.value?.toObject(); return this; },
      populate(fields) {
        const convert = document => {
          const data = document.toObject();
          for (const field of fields.split(' ')) {
            const user = stores.User.find(u => String(u._id) === String(data[field]));
            data[field] = user ? { _id: user._id, fullName: user.fullName, email: user.email } : null;
          }
          return { ...data, toObject: () => data };
        };
        this.value = Array.isArray(this.value) ? this.value.map(convert) : this.value ? convert(this.value) : null;
        return this;
      },
      then(resolve, reject) { return Promise.resolve(this.value).then(resolve, reject); },
    };
    return result;
  }
  function add(name, input) {
    const document = new models[name]({ createdAt: new Date(), updatedAt: new Date(), ...input });
    const error = document.validateSync();
    if (error) throw error;
    document.save = async () => {
      const error = document.validateSync();
      if (error) throw error;
      document.updatedAt = new Date();
      return document;
    };
    stores[name].push(document);
    return document;
  }
  for (const [name, Model] of Object.entries(models)) {
    const overrides = {
      find: filter => query(stores[name].filter(d => match(d, filter || {}))),
      findOne: filter => query(stores[name].find(d => match(d, filter)) || null),
      findById: id => query(stores[name].find(d => String(d._id) === String(id)) || null),
      countDocuments: async filter => stores[name].filter(d => match(d, filter)).length,
      exists: async filter => stores[name].some(d => match(d, filter)),
      create: async input => add(name, input),
      findOneAndDelete: async filter => {
        const index = stores[name].findIndex(d => match(d, filter));
        return index < 0 ? null : stores[name].splice(index, 1)[0];
      },
      findOneAndUpdate: async (filter, update) => {
        const document = stores[name].find(d => match(d, filter));
        if (document) Object.assign(document, update);
        return document || null;
      },
    };
    for (const [method, value] of Object.entries(overrides)) {
      originals.push([Model, method, Model[method]]);
      Model[method] = value;
    }
  }
  for (const [key, role, email, fullName] of [
    ['agent', 'Travel Agent', 'agent@example.test', 'Test Agent'], ['traveler', 'Traveler', 'traveler@example.test', 'Test Traveler'],
    ['otherAgent', 'Travel Agent', 'otheragent@example.test', 'Other Agent'], ['otherTraveler', 'Traveler', 'othertraveler@example.test', 'Other Traveler'],
  ]) add('User', { _id: ids[key], role, email, fullName, password: bcrypt.hashSync('TripWiseTest123!', 4) });
  add('Booking', { _id: ids.booking, agentId: ids.agent, travelerId: ids.traveler, clientName: 'Test Traveler',
    clientInitials: 'TT', destinationId: 'ella', destination: 'Ella', title: 'Ella Test Adventure', packageName: 'Ella Highlights',
    startDate: '2026-10-10', endDate: '2026-10-12', dates: '2026-10-10 – 2026-10-12', groupSize: 2, amount: 300,
    status: 'Confirmed', paidAt: new Date('2026-09-01'), schedule: [
      { day: 1, time: '09:00', title: 'Nine Arches Bridge', description: 'Bridge walk', status: 'active' },
      { day: 2, time: '19:00', title: 'Dinner reservation', description: 'Meet at the restaurant', status: 'future', reservation: true, menuUrl: 'https://example.com/menu' },
    ] });
  return { stores, add, restore() { for (const [Model, method, original] of originals) Model[method] = original; } };
}
module.exports = { installFixtures, ids };
