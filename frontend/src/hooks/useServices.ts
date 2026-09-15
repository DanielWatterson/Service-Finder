import { useEffect, useState } from "react";
import { getServices } from "../services/api";
import type { Service } from "../types/service.types";

export function useServices() {
	const [services, setServices] = useState<Service[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		let active = true;
		getServices()
			.then((data) => {
				if (active) setServices(data);
			})
			.catch((reason: unknown) => {
				if (active) setError(reason instanceof Error ? reason.message : "Unable to load services");
			})
			.finally(() => {
				if (active) setLoading(false);
			});
		return () => {
			active = false;
		};
	}, []);

	return { services, loading, error };
}
