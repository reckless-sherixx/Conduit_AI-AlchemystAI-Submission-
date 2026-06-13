"use client";

import React, { useState, useEffect, useRef } from 'react';

interface AutoTestRunnerProps {
  status: 'connected' | 'connecting' | 'disconnected';
  onSend: (content: string) => void;
  currentSeq: number;
  isStreaming: boolean;
  runTrigger?: number;
  onAbort?: () => void;
  onReconnect?: () => void;
  onReset?: () => void;
}

interface TestStep {
  label: string;
  action: () => void;
  status: 'idle' | 'running' | 'success' | 'failed';
  waitCondition: (seq: number, isStreaming: boolean) => boolean;
}

export function AutoTestRunner({ status, onSend, currentSeq, isStreaming, runTrigger, onAbort, onReconnect, onReset }: AutoTestRunnerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [activeStepIdx, setActiveStepIdx] = useState(-1);
  const [logs, setLogs] = useState<string[]>([]);
  const [isWaitingForConnection, setIsWaitingForConnection] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);

  
  const steps: TestStep[] = React.useMemo(() => [
    {
      label: '1. Simple Greeting',
      action: () => {
        onSend('hello');
        addLog('Sent "hello" trigger.');
      },
      status: 'idle',
      waitCondition: (seq: number, streaming: boolean) => !streaming && seq >= 15,
    },
    {
      label: '2. Report Summary',
      action: () => {
        onSend('summary');
        addLog('Sent "summary" trigger.');
      },
      status: 'idle',
      waitCondition: (seq: number, streaming: boolean) => !streaming && seq >= 22,
    },
    {
      label: '3. Multi-Tool Analysis',
      action: () => {
        onSend('analyze');
        addLog('Sent "analyze" trigger.');
      },
      status: 'idle',
      waitCondition: (seq: number, streaming: boolean) => !streaming && seq >= 30,
    },
    {
      label: '4. Knowledge Base Lookup',
      action: () => {
        onSend('find');
        addLog('Sent "find" trigger.');
      },
      status: 'idle',
      waitCondition: (seq: number, streaming: boolean) => !streaming && seq >= 18,
    },
    {
      label: '5. Large Context',
      action: () => {
        onSend('schema');
        addLog('Sent "schema" trigger.');
      },
      status: 'idle',
      waitCondition: (seq: number, streaming: boolean) => !streaming && seq >= 25,
    },
    {
      label: '6. Long Response',
      action: () => {
        onSend('long');
        addLog('Sent "long" trigger.');
      },
      status: 'idle',
      waitCondition: (seq: number, streaming: boolean) => !streaming && seq >= 60,
    },
    {
      label: '7. Default',
      action: () => {
        onSend('help');
        addLog('Sent "help" trigger.');
      },
      status: 'idle',
      waitCondition: (seq: number, streaming: boolean) => !streaming && seq >= 20,
    }
  ], [onSend]);

  const [stepStatuses, setStepStatuses] = useState<TestStep['status'][]>(steps.map(() => 'idle'));

  
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs, isExpanded]);

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString([], { hour12: false });
    setLogs(prev => [...prev, `[${time}] ${msg}`]);
  };

  const startSuite = () => {
    setIsRunning(true);
    setIsExpanded(true);
    setStepStatuses(steps.map(() => 'idle'));
    setLogs([]);
    addLog('Starting Automated Test Suite...');

    onReset?.();
    setIsWaitingForConnection(true);
    setActiveStepIdx(-1);
    addLog('Resetting session. Waiting for connection...');
  };

  useEffect(() => {
    if (isRunning && isWaitingForConnection && status === 'connected') {
      setIsWaitingForConnection(false);
      setActiveStepIdx(0);
      addLog('Transport connected. Starting steps...');
    }
  }, [isRunning, isWaitingForConnection, status]);

  const abortSuite = () => {
    setIsRunning(false);
    if (activeStepIdx >= 0) {
      setStepStatuses(prev => {
        const next = [...prev];
        if (next[activeStepIdx] === 'running') {
          next[activeStepIdx] = 'failed';
        }
        return next;
      });
    }
    setActiveStepIdx(-1);
    addLog('Test suite aborted by user.');
    onAbort?.();
  };

  useEffect(() => {
    if (runTrigger && runTrigger > 0) {
      startSuite();
    }
  }, [runTrigger]);

  
  useEffect(() => {
    if (!isRunning || activeStepIdx < 0) return;

    if (activeStepIdx >= steps.length) {
      addLog('All tests completed successfully!');
      setTimeout(() => {
        setIsRunning(false);
        setActiveStepIdx(-1);
      }, 0);
      return;
    }

    const currentStep = steps[activeStepIdx];

    
    if (stepStatuses[activeStepIdx] === 'idle') {
      setTimeout(() => {
        setStepStatuses(prev => {
          const next = [...prev];
          next[activeStepIdx] = 'running';
          return next;
        });
      }, 0);
      currentStep.action();
    }

    
    if (stepStatuses[activeStepIdx] === 'running') {
      if (currentStep.waitCondition(currentSeq, isStreaming)) {
        setTimeout(() => {
          setStepStatuses(prev => {
            const next = [...prev];
            next[activeStepIdx] = 'success';
            return next;
          });
          setActiveStepIdx(idx => idx + 1); 
        }, 0);
      }
    }
  }, [isRunning, activeStepIdx, stepStatuses, currentSeq, isStreaming, status, steps]);

  if (!isExpanded) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          className="nb-card bg-[var(--color-accent-teal)] px-4 py-2 flex items-center gap-2 hover:translate-x-[-2px] hover:translate-y-[-2px] transition-transform cursor-pointer"
          onClick={() => setIsExpanded(true)}
        >
          <div className="w-2.5 h-2.5 bg-black rounded-full animate-pulse-dot" />
          <span className="nb-mono text-[0.7rem] font-extrabold uppercase tracking-wide">Auto Test Runner</span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 nb-card w-[380px] max-h-[500px] flex flex-col bg-white overflow-hidden animate-slide-up">
      {}
      <div className="px-4 py-3 border-b-2 border-black flex items-center justify-between bg-[var(--color-secondary-bg)]">
        <h3 className="nb-title text-sm">AUTO TEST SUITE</h3>
        <button
          className="text-xl font-bold leading-none hover:text-[var(--color-accent-red)]"
          onClick={() => setIsExpanded(false)}
        >
          ×
        </button>
      </div>

      <div className="p-4 flex flex-col gap-4 overflow-y-auto">
        {}
        <div className={`p-2 border-2 border-black text-center ${isRunning ? 'bg-[var(--color-accent-teal)]' : 'bg-[var(--color-bg-canvas)]'}`}>
          <span className="nb-mono font-bold text-[0.75rem] uppercase">
            {isRunning ? `RUNNING STEP ${activeStepIdx + 1} OF ${steps.length}` : stepStatuses.every(s => s === 'success') ? 'ALL TESTS PASSED ✅' : 'READY TO RUN SUITE'}
          </span>
        </div>

        {}
        <div className="flex flex-col gap-2">
          {steps.map((step, idx) => {
            const st = stepStatuses[idx];
            return (
              <div key={idx} className="flex items-center gap-3">
                <div className={`w-4 h-4 border-2 border-black shrink-0 flex items-center justify-center ${
                  st === 'success' ? 'bg-[var(--color-accent-green)] text-xs font-bold' :
                  st === 'running' ? 'bg-[var(--color-accent-amber)] animate-spin-slow border-t-transparent rounded-full' :
                  st === 'failed' ? 'bg-[var(--color-accent-red)] text-white text-xs font-bold' :
                  'bg-gray-200'
                }`}>
                  {st === 'success' && '✓'}
                  {st === 'failed' && '✗'}
                </div>
                <span className={`nb-mono text-[0.75rem] ${st === 'running' ? 'font-bold text-black' : 'text-[var(--color-secondary-text)]'}`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>

        {}
        <div className="flex gap-2">
          {!isRunning ? (
            <button className="nb-btn nb-btn-primary flex-1 py-2 text-[0.8rem]" onClick={startSuite}>
              {stepStatuses.some(s => s === 'success') ? 'RE-RUN SUITE' : 'START SUITE'}
            </button>
          ) : (
            <button className="nb-btn nb-btn-danger flex-1 py-2 text-[0.8rem]" onClick={abortSuite}>
              ABORT
            </button>
          )}
        </div>

        {}
        <div className="flex flex-col border-2 border-black">
          <div className="bg-black text-white px-2 py-1 nb-mono text-[0.6rem] uppercase tracking-wider">
            Runner Logs
          </div>
          <div className="bg-[#1e1e1e] h-32 overflow-y-auto p-2">
            {logs.length === 0 ? (
              <span className="nb-mono text-[var(--color-muted-text)] text-[0.65rem]">Waiting to start...</span>
            ) : (
              logs.map((log, i) => (
                <div key={i} className="nb-mono text-[#a5d6ff] text-[0.65rem] whitespace-pre-wrap font-medium">
                  {log}
                </div>
              ))
            )}
            <div ref={logsEndRef} />
          </div>
        </div>
      </div>
    </div>
  );
}
