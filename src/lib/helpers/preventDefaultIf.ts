const preventDefaultIf = (event: Event, value: boolean) => {
	if (value) {
		event.preventDefault();
	}
};

export default preventDefaultIf;
