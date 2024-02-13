// pwdCheck.ts

export function passwordCheck(password: string): 1 | 2 | 3 {
	// 正则判断数字,大小写字母以及特殊字符
	let isDigit = /^.*[0-9]+.*/; // number
	let isLowerCase = /^.*[a-z]+.*/; // lower letters
	let isUpperCase = /^.*[A-Z]+.*/; // uppercase letters
	let regEx = /^.*[^a-zA-Z0-9]+.*/; // special symbols
	let i = 0;

	if (password === '' || password.length < 8 || password.length > 20) {
		// 密码长度不正确
		return 1;
	} else {
		// 每满足一个条件 i+1
		if (isDigit.test(password)) {
			i = i + 1;
		}
		if (isLowerCase.test(password)) {
			i = i + 1;
		}
		if (isUpperCase.test(password)) {
			i = i + 1;
		}
		if (regEx.test(password)) {
			i = i + 1;
		}
		if (i <= 2) {
			// 密码强度不够
			return 2;
		} else {
			// 密码强度足够
			return 3;
		}
	}
}
