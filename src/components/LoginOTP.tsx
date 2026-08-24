import React, { useState, useRef, useEffect } from 'react';
import { UserPlus, LogIn } from 'lucide-react';

interface LoginOTPProps {
  onSuccess: (role?: 'master' | 'lavajato' | 'cliente', unidadeNome?: string, telaCliente?: 'login' | 'cadastro' | 'home') => void;
  defaultRole?: 'master' | 'lavajato' | 'cliente';
}

export default function LoginOTP({ onSuccess, defaultRole = 'master' }: LoginOTPProps) {
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [message, setMessage] = useState<{ text: string; type: 'error' | 'info' | 'success' | '' }>({
    text: '',
    type: '',
  });
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  const SENHA_MASTER = '124020';

  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Focus first input on mount
  useEffect(() => {
    if (!isSuccess && inputsRef.current[0]) {
      inputsRef.current[0].focus();
    }
  }, [isSuccess]);

  const handleChange = (index: number, value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const char = cleaned.slice(-1);

    const newOtp = [...otp];
    newOtp[index] = char;
    setOtp(newOtp);
    setMessage({ text: '', type: '' });

    if (char && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
        inputsRef.current[index - 1]?.focus();
      } else {
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputsRef.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputsRef.current[index + 1]?.focus();
    } else if (e.key === 'Enter') {
      handleVerify();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pastedData) return;

    const newOtp = [...otp];
    for (let i = 0; i < 6; i++) {
      newOtp[i] = pastedData[i] || '';
    }
    setOtp(newOtp);
    setMessage({ text: '', type: '' });

    const nextIndex = Math.min(pastedData.length, 5);
    inputsRef.current[nextIndex]?.focus();
  };

  const handleVerify = () => {
    const fullOtp = otp.join('');

    if (fullOtp.length < 6) {
      setMessage({ text: 'Por favor, preencha todos os 6 dígitos da senha.', type: 'error' });
      return;
    }

    setIsVerifying(true);
    setMessage({ text: 'Validando credenciais...', type: 'info' });

    setTimeout(() => {
      // 1. Verificação da Senha Master: 124020
      if (fullOtp === SENHA_MASTER) {
        setIsVerifying(false);
        setIsSuccess(true);
        setTimeout(() => {
          onSuccess('master');
        }, 700);
        return;
      }

      // 2. Verificação estrita e dinâmica apenas com lava-jatos cadastrados no banco
      let unidadeEncontrada: any = null;
      try {
        const salvos = localStorage.getItem('hubwash_lava_jatos');
        if (salvos) {
          const lista = JSON.parse(salvos);
          if (Array.isArray(lista)) {
            unidadeEncontrada = lista.find((u: any) => String(u.senhaProvisoria).trim() === fullOtp);
          }
        }
      } catch (e) {
        console.error(e);
      }

      if (unidadeEncontrada) {
        if (unidadeEncontrada.statusPlano === 'bloqueado') {
          setIsVerifying(false);
          setMessage({
            text: `Acesso bloqueado para "${unidadeEncontrada.nomeFantasia}". Entre em contato com o suporte SaaS.`,
            type: 'error'
          });
          setOtp(['', '', '', '', '', '']);
          inputsRef.current[0]?.focus();
          return;
        }

        setIsVerifying(false);
        setIsSuccess(true);
        setTimeout(() => {
          onSuccess('lavajato', unidadeEncontrada.nomeFantasia);
        }, 700);
      } else {
        setIsVerifying(false);
        setMessage({
          text: 'Senha incorreta ou inexistente! Verifique os dígitos e tente novamente.',
          type: 'error'
        });
        setOtp(['', '', '', '', '', '']);
        inputsRef.current[0]?.focus();
      }
    }, 500);
  };

  const preencherSenha = (senha: string) => {
    const chars = senha.split('').slice(0, 6);
    setOtp(chars);
    setMessage({ text: '', type: '' });
  };

  const getPrimeiraUnidade = () => {
    try {
      const salvos = localStorage.getItem('hubwash_lava_jatos');
      if (salvos) {
        const lista = JSON.parse(salvos);
        if (Array.isArray(lista) && lista.length > 0) {
          return lista[0].nomeFantasia;
        }
      }
    } catch {}
    return 'Lava Jato';
  };

  return (
    <div className="otp-wrapper">
      <div className="otp-card">
        {!isSuccess ? (
          <div id="otpForm">
            <div className="lock">🔐</div>
            <h1>Terminal de Acesso</h1>
            <p className="description">
              Por favor, autentique para continuar
            </p>

            <div className="otp-inputs" id="otpInputs">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputsRef.current[index] = el;
                  }}
                  className={`otp-input ${digit ? 'filled' : ''}`}
                  type="password"
                  inputMode="numeric"
                  maxLength={1}
                  autoComplete={index === 0 ? 'one-time-code' : 'off'}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  disabled={isVerifying}
                />
              ))}
            </div>

            <button
              className="verify-btn"
              id="verifyBtn"
              type="button"
              onClick={handleVerify}
              disabled={isVerifying || otp.join('').length < 6}
            >
              {isVerifying ? 'Verificando...' : 'Acessar Sistema'}
            </button>

            {message.text && (
              <div
                className={`message ${message.type === 'error' ? 'error' : message.type === 'info' ? 'info' : ''}`}
                id="message"
              >
                {message.text}
              </div>
            )}

            <div className="mt-6 pt-5 border-t border-slate-800 space-y-2.5 text-center">
              <button
                type="button"
                onClick={() => onSuccess('cliente', getPrimeiraUnidade(), 'cadastro')}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-blue-900/30 transition cursor-pointer flex items-center justify-center gap-2"
              >
                <UserPlus size={16} />
                <span>Cadastrar</span>
              </button>

              <button
                type="button"
                onClick={() => onSuccess('cliente', getPrimeiraUnidade(), 'login')}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 font-bold text-xs uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2"
              >
                <LogIn size={16} />
                <span>Sou Cliente! Acessar</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="success-screen" id="successScreen">
            <div className="success-icon">✓</div>
            <h2>Acesso Autorizado</h2>
            <p>
              Credencial verificada com sucesso!
              <br />
              Redirecionando...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
