export default {
	test: {
		globals: true,
		environment: "node",
		include: ["src/__tests__/**/*.test.ts"],
		testTimeout: 20000,
	},
};
