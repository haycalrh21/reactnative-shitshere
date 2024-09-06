import Supabase from "../lib/supabase";
import { uploadImage } from "./imageServices";

// Fungsi untuk mendapatkan nama file dari URI
const getFileName = (uri) => {
	return uri.split("/").pop();
};

export const createPost = async (post) => {
	try {
		if (post.file && typeof post.file === "string") {
			const isImage =
				post.file.endsWith(".png") ||
				post.file.endsWith(".jpg") ||
				post.file.endsWith(".jpeg");
			const folderName = isImage ? "postImages" : "postVideos";
			const fileName = getFileName(post.file);

			// Unggah gambar/video dan simpan path yang benar
			const resultFile = await uploadImage(folderName, post.file, isImage);
			if (resultFile) {
				post.file = resultFile; // Menyimpan path yang benar dari hasil upload
			} else {
				console.error("Failed to upload file");
				return null;
			}
		}

		// Buat atau perbarui postingan di database
		const { data, error } = await Supabase.from("posts")
			.upsert(post)
			.select()
			.single();

		if (error) {
			console.error("Error creating post:", error);
			return null;
		}
		return data;
	} catch (error) {
		console.error("Error in createPost:", error);
		return null;
	}
};

export const fetchPost = async (limit = 10, userId) => {
	try {
		if (userId) {
			const { data, error } = await Supabase.from("posts")
				.select(
					`*, user:users(id,name,image), postLikes(*), comments(*,user :users(id,name,image))`
				)
				.eq("userId", userId)
				.order("created_at", { ascending: false })
				.limit(limit);
			return data;
		} else {
			const { data, error } = await Supabase.from("posts")
				.select(`*, user:users(id,name,image), postLikes(*), comments(count)`)
				.limit(limit)
				.order("created_at", { ascending: false });

			if (error) {
				console.error("Error fetching posts:", error);
				return null;
			}
			return data;
		}
	} catch (error) {
		console.error("Error in createPost:", error);
		return null;
	}
};

export const likePosts = async (postLike) => {
	try {
		const { data, error } = await Supabase.from("postLikes")
			.insert(postLike)
			.select()
			.single();
		return data;
	} catch (error) {
		console.error("Error in createPost:", error);
		return null;
	}
};

export const removelikePosts = async (postId, userId) => {
	try {
		const { error } = await Supabase.from("postLikes")
			.delete()
			.eq("userId", userId)
			.eq("postId", postId);

		if (error) {
			throw error; // Melempar error agar bisa ditangani di luar jika diperlukan
		}

		return;
	} catch (error) {
		console.error("Error in removelikePosts:", error);
		return null;
	}
};

export const getDetailPost = async (postId) => {
	try {
		const { data, error } = await Supabase.from("posts")
			.select(
				`*, user:users(id,name,image), postLikes(*), comments(*,user :users(id,name,image))`
			)
			.eq("id", postId)
			.order("created_at", { ascending: false, foreignTable: "comments" })
			.single();

		if (error) {
			console.error("Error fetching posts:", error);
			return null;
		}
		return data;
	} catch (error) {
		console.error("Error in getDetailPost:", error);
		return null;
	}
};
export const createComment = async (comment) => {
	try {
		const { data, error } = await Supabase.from("comments")
			.insert(comment)
			.select()
			.single();

		if (error) {
			console.error("Error fetching posts:", error);
			return null;
		}
		return data;
	} catch (error) {
		console.error("Error in getDetailPost:", error);
		return null;
	}
};

export const removeComment = async (commentId) => {
	try {
		const { error } = await Supabase.from("comments")
			.delete()
			.eq("id", commentId);

		if (error) {
			throw error; // Throw error to be handled by the caller
		}

		return true; // Return true to indicate success
	} catch (error) {
		console.error("Error in removeComment:", error);
		return null; // Return null to indicate failure
	}
};

export const removePosts = async (postId) => {
	try {
		const { error } = await Supabase.from("posts").delete().eq("id", postId);

		if (error) {
			throw error; // Throw error to be handled by the caller
		}

		return true; // Return true to indicate success
	} catch (error) {
		console.error("Error in removeComment:", error);
		return null; // Return null to indicate failure
	}
};
