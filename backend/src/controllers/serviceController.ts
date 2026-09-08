import { NextFunction, Request, Response } from 'express'
import { supabase } from '../config/supabase'
import { fetchServiceDetails } from '../models/Service'

export async function getServices(req: Request, res: Response, next: NextFunction) {
	try {
		const type = typeof req.query.type === 'string' ? req.query.type : undefined
		const search = typeof req.query.q === 'string' ? req.query.q.trim() : undefined
		const requestedLimit = Number(req.query.limit ?? 100)
		const limit = Number.isInteger(requestedLimit)
			? Math.min(Math.max(requestedLimit, 1), 500)
			: 100

		let query = supabase.from('services').select('*').limit(limit)

		if (type) query = query.eq('type', type)
		if (search) query = query.ilike('name', `%${search}%`)

		const { data, error } = await query
		if (error) throw error

		res.json(data ?? [])
	} catch (error) {
		next(error)
	}
}

export async function getServiceDetails(req: Request, res: Response, next: NextFunction) {
	try {
		const service = await fetchServiceDetails(req.params.externalId)

		if (!service) {
			res.status(404).json({ message: 'Service not found' })
			return
		}

		res.json(service)
	} catch (error) {
		next(error)
	}
}
