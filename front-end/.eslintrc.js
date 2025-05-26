module.exports = {
    "env": {
        "browser": true,
        "es2021": true
    },
    "extends": [
        "eslint:recommended",
        "plugin:vue/essential"
    ],
    "parserOptions": {
        "ecmaVersion": 12,
        "sourceType": "module"
    },
    "plugins": [
        "vue"
    ],
    "rules": {
    },
    env: {
        browser: true,
        node: true, // ✅ 이 줄을 추가하면 process 허용됨
        es2021: true,
    },
    globals: {
        defineProps: 'readonly',
        defineEmits: 'readonly',
    }
};
