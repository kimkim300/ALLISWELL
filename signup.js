// Firebase SDK
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getDatabase, ref, set, get } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';

// Firebase 설정
const firebaseConfig = {
    apiKey: "AIzaSyAf_G73VSdOrcySo-kDZYHAEJzMV-f_SZk",
    authDomain: "alliswell-backend.firebaseapp.com",
    projectId: "alliswell-backend",
    storageBucket: "alliswell-backend.firebasestorage.app",
    messagingSenderId: "111695162731",
    appId: "1:111695162731:web:51b50c36cf6ab3ef55302e",
    measurementId: "G-99YL7GDMHM",
    databaseURL: "https://alliswell-backend-default-rtdb.asia-southeast1.firebasedatabase.app/"
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

// 전역 변수로 Firebase 인스턴스들을 window 객체에 할당
window.firebaseAuth = auth;
window.firebaseDatabase = database;
window.createUserWithEmailAndPassword = createUserWithEmailAndPassword;
window.updateProfile = updateProfile;
window.set = set;
window.ref = ref;

class SignupManager {
    constructor() {
        this.bindEvents();
        this.checkFirebaseStatus();
    }

    bindEvents() {
        const signupForm = document.getElementById('signupForm');
        signupForm.addEventListener('submit', (e) => this.handleSignup(e));
        
        // 실시간 유효성 검사
        document.getElementById('signupName').addEventListener('blur', () => this.validateName());
        document.getElementById('signupUsername').addEventListener('blur', () => this.validateUsername());
        document.getElementById('signupEmail').addEventListener('blur', () => this.validateEmail());
        document.getElementById('signupPassword').addEventListener('blur', () => this.validatePassword());
        document.getElementById('signupConfirmPassword').addEventListener('blur', () => this.validateConfirmPassword());
    }

    validateName() {
        const name = document.getElementById('signupName').value.trim();
        const nameError = document.getElementById('nameError');
        const nameInput = document.getElementById('signupName');

        if (!name) {
            nameError.style.display = 'block';
            nameInput.classList.add('error');
            return false;
        } else {
            nameError.style.display = 'none';
            nameInput.classList.remove('error');
            return true;
        }
    }

    validateUsername() {
        const username = document.getElementById('signupUsername').value.trim();
        const usernameError = document.getElementById('usernameError');
        const usernameInput = document.getElementById('signupUsername');

        if (!username) {
            usernameError.textContent = '아이디를 입력해주세요.';
            usernameError.style.display = 'block';
            usernameInput.classList.add('error');
            return false;
        } else if (username.length < 3) {
            usernameError.textContent = '아이디는 최소 3자 이상이어야 합니다.';
            usernameError.style.display = 'block';
            usernameInput.classList.add('error');
            return false;
        } else {
            usernameError.style.display = 'none';
            usernameInput.classList.remove('error');
            return true;
        }
    }

    validateEmail() {
        const email = document.getElementById('signupEmail').value.trim();
        const emailError = document.getElementById('emailError');
        const emailInput = document.getElementById('signupEmail');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!email) {
            emailError.textContent = '이메일을 입력해주세요.';
            emailError.style.display = 'block';
            emailInput.classList.add('error');
            return false;
        } else if (!emailRegex.test(email)) {
            emailError.textContent = '올바른 이메일 형식을 입력해주세요.';
            emailError.style.display = 'block';
            emailInput.classList.add('error');
            return false;
        } else {
            emailError.style.display = 'none';
            emailInput.classList.remove('error');
            return true;
        }
    }

    validatePassword() {
        const password = document.getElementById('signupPassword').value;
        const passwordError = document.getElementById('passwordError');
        const passwordInput = document.getElementById('signupPassword');

        if (password.length < 6) {
            passwordError.style.display = 'block';
            passwordInput.classList.add('error');
            return false;
        } else {
            passwordError.style.display = 'none';
            passwordInput.classList.remove('error');
            return true;
        }
    }

    validateConfirmPassword() {
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('signupConfirmPassword').value;
        const confirmPasswordError = document.getElementById('confirmPasswordError');
        const confirmPasswordInput = document.getElementById('signupConfirmPassword');

        if (password !== confirmPassword) {
            confirmPasswordError.style.display = 'block';
            confirmPasswordInput.classList.add('error');
            return false;
        } else {
            confirmPasswordError.style.display = 'none';
            confirmPasswordInput.classList.remove('error');
            return true;
        }
    }

    handleSignup(e) {
        e.preventDefault();
        
        // 모든 유효성 검사 실행
        const isNameValid = this.validateName();
        const isUsernameValid = this.validateUsername();
        const isEmailValid = this.validateEmail();
        const isPasswordValid = this.validatePassword();
        const isConfirmPasswordValid = this.validateConfirmPassword();

        if (!isNameValid || !isUsernameValid || !isEmailValid || !isPasswordValid || !isConfirmPasswordValid) {
            return;
        }

        const name = document.getElementById('signupName').value.trim();
        const username = document.getElementById('signupUsername').value.trim();
        const email = document.getElementById('signupEmail').value.trim();
        const password = document.getElementById('signupPassword').value;

        // Firebase를 이용한 실제 회원가입
        this.createFirebaseAccount(name, username, email, password);
    }

    createFirebaseAccount(name, username, email, password) {
        const submitBtn = document.getElementById('signupSubmitBtn');
        const originalText = submitBtn.textContent;
        
        submitBtn.textContent = '🔄 회원가입 중...';
        submitBtn.disabled = true;

        // Firebase Auth를 이용한 계정 생성
        if (window.createUserWithEmailAndPassword && window.firebaseAuth) {
            window.createUserWithEmailAndPassword(window.firebaseAuth, email, password)
                .then((userCredential) => {
                    const user = userCredential.user;
                    console.log('Firebase Auth 계정 생성 성공:', user.uid);
                    
                    // 사용자 프로필 업데이트 (displayName 설정)
                    return window.updateProfile(user, {
                        displayName: username
                    });
                })
                .then(() => {
                    console.log('사용자 프로필 업데이트 성공');
                    // Firebase Realtime Database에 사용자 정보 저장
                    return this.saveUserToDatabase(name, username, email);
                })
                .then(() => {
                    console.log('Firebase Database 저장 성공');
                    console.log('저장된 사용자 정보 확인:', { name, username, email });
                    
                    // Firebase에서 저장된 데이터 확인 및 검증
                    if (database) {
                        const userRef = ref(database, 'users/' + username);
                        get(userRef).then((snapshot) => {
                            if (snapshot.exists()) {
                                const savedData = snapshot.val();
                                console.log('Firebase에 실제로 저장된 데이터:', savedData);
                                console.log('저장된 name 값:', savedData.name);
                                
                                // name 필드가 제대로 저장되지 않은 경우 재시도
                                if (!savedData.name || savedData.name.trim() === '') {
                                    console.log('name 필드가 제대로 저장되지 않음, 재시도...');
                                    set(userRef, {
                                        ...savedData,
                                        name: name
                                    }).then(() => {
                                        console.log('name 필드 재저장 완료');
                                    }).catch((retryError) => {
                                        console.error('name 필드 재저장 실패:', retryError);
                                    });
                                }
                            }
                        });
                    }
                    
                    // 회원가입 완료 상태 표시
                    submitBtn.textContent = '✅ 회원가입 완료!';
                    submitBtn.classList.add('completed');
                    
                    // 잠시 후 성공 처리
                    setTimeout(() => {
                        this.signupSuccess(name, username);
                    }, 1500);
                })
                .catch((error) => {
                    console.error('Firebase 회원가입 오류:', error);
                    this.handleSignupError(error);
                    // 오류 발생 시 버튼 상태 복원
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                    submitBtn.classList.remove('completed');
                });
        } else {
            console.log('Firebase SDK가 로드되지 않음, 로컬 회원가입으로 폴백');
            // Firebase가 로드되지 않은 경우 로컬 회원가입으로 폴백
            this.fallbackToLocalSignup(name, username, email, password);
        }
    }

    saveUserToDatabase(name, username, email) {
        console.log('saveUserToDatabase 호출됨:', { name, username, email });
        
        // 직접 import된 Firebase SDK 사용 (가장 안전한 방법)
        if (database) {
            console.log('직접 import된 Firebase SDK 사용');
            const userRef = ref(database, 'users/' + username);
            const userData = {
                name: name,
                username: username,
                email: email,
                createdAt: new Date().toISOString(),
                lastLogin: new Date().toISOString()
            };
            console.log('Firebase에 저장할 사용자 데이터:', userData);
            return set(userRef, userData);
        } else if (window.set && window.ref && window.firebaseDatabase) {
            console.log('window 객체의 Firebase SDK 사용');
            const userRef = window.ref(window.firebaseDatabase, 'users/' + username);
            const userData = {
                name: name,
                username: username,
                email: email,
                createdAt: new Date().toISOString(),
                lastLogin: new Date().toISOString()
            };
            console.log('Firebase에 저장할 사용자 데이터:', userData);
            return window.set(userRef, userData);
        } else {
            console.error('Firebase SDK를 찾을 수 없음');
            return Promise.reject(new Error('Firebase SDK를 찾을 수 없습니다.'));
        }
    }

    handleSignupError(error) {
        let errorMessage = '회원가입 중 오류가 발생했습니다.';
        
        switch (error.code) {
            case 'auth/email-already-in-use':
                errorMessage = '이미 사용 중인 이메일입니다.';
                break;
            case 'auth/invalid-email':
                errorMessage = '유효하지 않은 이메일 형식입니다.';
                break;
            case 'auth/operation-not-allowed':
                errorMessage = '이메일/비밀번호 회원가입이 비활성화되어 있습니다.';
                break;
            case 'auth/weak-password':
                errorMessage = '비밀번호가 너무 약합니다. 더 강한 비밀번호를 사용해주세요.';
                break;
            default:
                errorMessage = `오류: ${error.message}`;
        }
        
        alert(`❌ ${errorMessage}`);
        console.error('Firebase 회원가입 오류:', error);
    }

    fallbackToLocalSignup(name, username, email, password) {
        const submitBtn = document.getElementById('signupSubmitBtn');
        submitBtn.textContent = '🔄 로컬 회원가입 중...';
        
        // 2초 후 로컬 회원가입 성공 시뮬레이션
        setTimeout(() => {
            // 회원가입 완료 상태 표시
            submitBtn.textContent = '✅ 회원가입 완료!';
            submitBtn.classList.add('completed');
            
            // 잠시 후 성공 처리
            setTimeout(() => {
                this.signupSuccess(name, username);
            }, 1500);
        }, 2000);
    }

    checkFirebaseStatus() {
        const statusElement = document.getElementById('firebaseStatus');
        const statusText = statusElement.querySelector('.status-text');
        
        if (database && auth) {
            statusElement.className = 'firebase-status connected';
            statusText.textContent = '✅ Firebase 연결됨 - 실제 회원가입 가능';
            console.log('Firebase 상태: 연결됨');
        } else if (window.firebaseAuth && window.createUserWithEmailAndPassword) {
            statusElement.className = 'firebase-status connected';
            statusText.textContent = '✅ Firebase 연결됨 - 실제 회원가입 가능';
            console.log('Firebase 상태: window 객체를 통한 연결');
        } else {
            statusElement.className = 'firebase-status disconnected';
            statusText.textContent = '❌ Firebase 연결 안됨 - 로컬 회원가입 모드';
            console.log('Firebase 상태: 연결 안됨');
        }
    }

    signupSuccess(name, username) {
        console.log('signupSuccess 호출됨:', { name, username });
        
        // 버튼 상태 완전 초기화
        const submitBtn = document.getElementById('signupSubmitBtn');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.classList.remove('completed');
            submitBtn.textContent = '🚀 회원가입'; // 원래 텍스트로 복원
            submitBtn.style.background = ''; // 원래 스타일로 복원
        }
        
        // 이메일 정보 가져오기
        const email = document.getElementById('signupEmail').value.trim();
        
        // 사용자 데이터를 localStorage에 저장 (로그인 시 이름을 가져오기 위해)
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        userData[username] = {
            name: name,
            username: username,
            email: email,
            createdAt: new Date().toISOString()
        };
        localStorage.setItem('userData', JSON.stringify(userData));
        
        console.log('localStorage에 사용자 데이터 저장 완료:', userData[username]);
        
        // 성공 메시지
        alert(`🎉 ${name}님, 회원가입이 완료되었습니다!\n\n이제 로그인할 수 있습니다.`);

        // 로그인 페이지로 리다이렉트
        window.location.href = 'login.html';
    }
}

// 회원가입 매니저 초기화
const signupManager = new SignupManager();

// 페이지 로드 시 첫 번째 입력 필드에 포커스
window.addEventListener('load', () => {
    document.getElementById('signupName').focus();
});
