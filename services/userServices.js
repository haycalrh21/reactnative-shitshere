import Supabase from "../lib/supabase";

const getUserData = async (userId) => {
	try {
		const { data, error } = await Supabase.from("users")
			.select()
			.eq("id", userId)
			.single();

		if (error) {
			console.log("Error fetching user data:", error);
			return { success: false, data: null };
		}

		return { success: true, data };
	} catch (error) {
		console.log("Error fetching user data:", error);
		return { success: false, data: null };
	}
};

export const updateUser = async (userId, data) => {
	try {
		const { error } = await Supabase.from("users")
			.update(data)
			.eq("id", userId);
		if (error) {
			console.log("Error fetching user data:", error);
		}

		return data;
	} catch (error) {
		console.log("Error fetching user data:", error);
	}
};

export default getUserData;
