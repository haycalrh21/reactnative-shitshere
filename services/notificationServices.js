import Supabase from "../lib/supabase";

export const createNotification = async (notification) => {
	try {
		const { data, error } = await Supabase.from("notifications")
			.insert(notification)
			.select()
			.single();

		if (error) {
			console.error("Error creating notification:", error);
			return null;
		}
		return data;
	} catch (error) {
		console.error("Error in createNotification:", error);
		return null;
	}
};

export const fetchNotification = async (receiveId) => {
	try {
		const { data, error } = await Supabase.from("notifications")
			.select(`*, sender:senderId(id,name,image)`)
			.eq("receiveId", receiveId)
			.order("created_at", { ascending: false });

		if (error) {
			console.error("Error fetching notifications:", error);
			return { success: false, data: [] };
		}
		return { success: true, data };
	} catch (error) {
		console.error("Error in fetchNotification:", error);
		return { success: false, data: [] };
	}
};
