# Architecture Guide

> 아키텍처 가이드

## 목차

1. [프로젝트 개요](#프로젝트-개요)
2. [아키텍처 패턴](#아키텍처-패턴)
3. [디렉토리 구조](#디렉토리-구조)
4. [레이어별 설명](#레이어별-설명)
5. [데이터 흐름](#데이터-흐름)
6. [주요 컴포넌트](#주요-컴포넌트)
7. [의존성 관계](#의존성-관계)

---

## 프로젝트 개요

### 목적
Google AIStudio에서 생성한 React 앱을 프로덕션 준비된 monorepo 구조로 자동 변환하고, Gemini API를 활용한 AI 기반 코드 리팩토링을 수행합니다.

### 핵심 기능
1. **ZIP 파일 처리**: 로컬 또는 S3에서 AIStudio 앱 다운로드/추출
2. **템플릿 클론**: GitHub에서 monorepo 템플릿 가져오기
3. **파일 재구성**: 백엔드/프론트엔드 분리
4. **AI 리팩토링**: Gemini API로 코드 자동 변환
5. **구조 생성**: 프로덕션 준비된 monorepo 출력

---

## 아키텍처 패턴

이 프로젝트는 다음과 같은 아키텍처 패턴을 따릅니다.

```
┌─────────────────────────────────────────────────────────┐
│                    CLI Entry Point                      │
│                 (사용자 명령어 입력)                        │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                    Engine Layer                         │
│              (서비스 초기화 및 의존성 주입)                    │
│  - 모든 서비스 인스턴스 생성                                  │
│  - 명령어 인스턴스 생성 (DI)                                 │
│  - Singleton 패턴으로 export                              │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                   Command Layer                         │
│               (CLI 명령어별 진입점)                         │
│  - 옵션 파싱 및 검증                                        │
│  - Service 호출                                          │
│  - 결과 포맷팅 및 출력                                      │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                   Service Layer                         │
│                (비즈니스 로직 구현)                         │
│  - 복잡한 워크플로우 조율                                    │
│  - 여러 모듈 조합                                          │
│  - 에러 처리 및 로깅                                        │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                   Module Layer                          │
│              (재사용 가능한 기능 단위)                        │
│  - 독립적인 기능                                           │
│  - 명확한 책임 분리                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 디렉토리 구조

```
src/
├── cli.ts                      # CLI 진입점 (Commander.js)
├── engine.ts                   # 엔진 - 서비스 초기화
│
├── commands/                   # Command Layer
│   ├── cmd-generate.ts         # 생성 명령어
│   ├── cmd-init.ts             # 초기화 명령어
│   ├── cmd-validate.ts         # 검증 명령어
│   └── cmd-list.ts             # 목록 명령어
│
├── service/                    # Service Layer
│   ├── generator-service.ts    # 메인 생성 워크플로우
│   ├── config-service.ts       # 설정 관리
│   ├── template-service.ts     # 템플릿 관리
│   └── gemini-service.ts       # Gemini API 통신
│
├── cores/                      # 공통 추상화 및 타입
│   ├── abstract-command.ts     # 명령어 베이스 클래스
│   ├── abstract-service.ts     # 서비스 베이스 클래스
│   └── types.ts                # TypeScript 타입 정의
│
├── utils/                      # 유틸리티
│   └── logger.ts               # 로깅 유틸리티
│
└── templates/                  # AI 리팩토링 템플릿
    └── default/
        ├── backend/            # 백엔드 리팩토링 프롬프트
        │   ├── config.json
        │   ├── system.md
        │   └── user.md
        └── frontend/           # 프론트엔드 리팩토링 프롬프트
            ├── config.json
            ├── system.md
            └── user.md
```

---

## 레이어별 설명

### 1. CLI Layer (`cli.ts`)

**책임**: 사용자 명령어 입력 받기 및 파싱

**주요 코드**:
```typescript
program
    .command('generate')
    .option('-i, --input <path>', 'Input ZIP file path')
    .action(async (options) => {
        const { $engine } = require('./engine');
        await $engine.generateCmd.execute(options);
    });
```

**중요 포인트**:
- `Commander.js` 사용
- **Lazy loading**: `require('./engine')`을 action 내부에서 호출 (초기화 시간 단축)
- 옵션만 파싱, 실제 로직은 Command Layer로 위임

---

### 2. Engine Layer (`engine.ts`)

**책임**: 서비스 초기화 및 의존성 주입

**주요 코드**:
```typescript
// 서비스 인스턴스 생성
const configService = new ConfigService();
const templateService = new TemplateService();
const geminiService = new GeminiService();
const generatorService = new GeneratorService(
    configService,      // DI
    templateService,    // DI
    geminiService       // DI
);

// 명령어 인스턴스 생성 (서비스 주입)
const generateCmd = new GenerateCommand(generatorService);

// Singleton export
export const $engine = {
    generatorService,
    configService,
    generateCmd,
    // ...
};
```

**중요 포인트**:
- **모든 서비스를 한 곳에서 초기화**
- Constructor 기반 의존성 주입
- Singleton 패턴 (`$engine` export)
- 순환 참조 방지

---

### 3. Command Layer (`commands/`)

**책임**: CLI 명령어별 진입점, 옵션 검증, 결과 출력

**구조 패턴**:
```typescript
export class GenerateCommand extends AbstractCommand {
    public constructor(
        private readonly service: GeneratorService  // DI
    ) {
        super('generate');
    }

    public async execute(options: GenerateOptions): Promise<void> {
        try {
            // 1. 사용자에게 시작 메시지
            console.log(chalk.cyan('🚀 AIStudio Monorepo Generator'));

            // 2. 서비스 호출
            const result = await this.service.generate(options);

            // 3. 결과 포맷팅 및 출력
            console.log(chalk.green('✅ Generation completed!'));
            console.log('Files processed:', result.filesProcessed);
        } catch (error) {
            this.handleError(error);  // 에러 처리
        }
    }
}
```

**중요 포인트**:
- `AbstractCommand`를 상속
- **UI 관련 코드만** (console.log, chalk 등)
- 비즈니스 로직은 Service로 위임
- 에러 핸들링 및 사용자 친화적 메시지

**언제 수정하나요?**
- 새로운 CLI 옵션 추가
- 출력 형식 변경
- 사용자 메시지 개선

---

### 4. Service Layer (`service/`)

**책임**: 비즈니스 로직 구현, 워크플로우 조율

#### 4.1 GeneratorService (메인 워크플로우)

**주요 메서드**:
```typescript
export class GeneratorService extends AbstractService {
    public constructor(
        private readonly configService: ConfigService,
        private readonly templateService: TemplateService,
        private readonly geminiService: GeminiService
    ) {
        super('generator');
    }

    public async generate(options: GenerateOptions): Promise<RefactorResult> {
        // 1. 설정 로드
        const config = await this.configService.load(options);

        // 2. 입력 준비 (S3 다운로드 또는 로컬)
        const inputPath = await this.prepareInput(config);

        // 3. 템플릿 클론
        const outputPath = await this.cloneTemplate(config);

        // 4. 파일 추출
        await this.extractFiles(inputPath, outputPath);

        // 5. 백엔드 리팩토링
        const backendTokens = await this.refactorBackend(outputPath, config);

        // 6. 프론트엔드 리팩토링
        const frontendTokens = await this.refactorFrontend(outputPath, config);

        // 7. 결과 반환
        return { success: true, tokensUsed: backendTokens + frontendTokens };
    }
}
```

**중요 포인트**:
- 전체 워크플로우를 **순차적으로 조율**
- 각 단계를 private 메서드로 분리
- 에러 발생 시 throw (Command Layer가 처리)

#### 4.2 ConfigService (설정 관리)

**설정 우선순위**:
```
CLI 옵션 > 설정 파일 > 환경 변수 > 기본값
```

**주요 메서드**:
```typescript
public async load(options: GenerateOptions): Promise<GeneratorConfig> {
    // 1. 환경 변수에서 로드
    const envConfig = this.loadFromEnv();

    // 2. 파일에서 로드 (.mono-gen.json)
    const fileConfig = await this.loadFromFile();

    // 3. 병합 (우선순위 적용)
    const config = this.merge(envConfig, fileConfig, options);

    // 4. 검증
    this.validate(config);

    return config;
}
```

#### 4.3 TemplateService (템플릿 관리)

**책임**: AI 리팩토링 프롬프트 로드 및 렌더링

```typescript
// 프롬프트 로드
const prompts = await templateService.loadPrompt('default', 'backend');
// { system: "...", user: "..." }

// 변수 렌더링 (Mustache)
const rendered = templateService.renderPrompt(prompts.user, {
    serviceCode: "export const service = ..."
});
```

#### 4.4 GeminiService (Gemini API)

**책임**: Google Gemini API 호출 및 응답 처리

```typescript
const result = await geminiService.refactor(
    systemPrompt,     // AI 역할 정의
    userPrompt,       // 실제 요청
    config.gemini     // API 설정
);
// { content: "...", tokensUsed: 1234 }
```

**언제 수정하나요?**
- 워크플로우 변경 (새 단계 추가)
- 외부 API 통합 변경
- 비즈니스 로직 개선

---

### 5. Cores Layer (`cores/`)

**책임**: 공통 추상화 및 타입 정의

#### 5.1 Abstract Classes

**AbstractCommand**:
```typescript
export abstract class AbstractCommand {
    protected constructor(protected readonly name: string) {}

    // 모든 Command가 구현해야 하는 메서드
    public abstract execute(options: any): Promise<void>;

    // 공통 에러 처리
    protected handleError(error: Error): never {
        _err(this.name, 'Error:', error.message);
        process.exit(1);
    }
}
```

**AbstractService**:
```typescript
export abstract class AbstractService {
    protected constructor(protected readonly name: string) {}

    // 모든 Service가 구현해야 하는 메서드
    public abstract hello(): string;
}
```

#### 5.2 Type System (`types.ts`)

**모든 타입을 한 곳에 정의**:
```typescript
// CLI 옵션
export interface GenerateOptions {
    input?: string;
    output?: string;
    s3?: string;
    template?: string;
    dryRun?: boolean;
    skipRefactor?: boolean;
}

// 병합된 설정
export interface GeneratorConfig {
    projectName: string;
    inputPath: string;
    outputPath: string;
    gemini: GeminiConfig;
    logging: LoggingConfig;
}

// Gemini API 설정
export interface GeminiConfig {
    apiKey: string;
    model: string;
    temperature: number;
    topP: number;
    maxOutputTokens: number;
}
```

**중요 포인트**:
- 모든 인터페이스를 한 파일에 모음
- export하여 전체 프로젝트에서 사용
- 타입 안정성 보장

---

### 6. Utils Layer (`utils/`)

**책임**: 재사용 가능한 유틸리티

#### Logger (`logger.ts`)

**네임스페이스 로깅**:
```typescript
const NS = $U.NS('SERVICE', 'cyan');  // [SERVICE] 생성 (파란색)
_log(NS, 'Starting...');              // [SERVICE] Starting...
_inf(NS, 'Complete');                 // [SERVICE] Complete (파란색)
_err(NS, 'Failed');                   // [SERVICE] Failed (빨간색)
```

**로그 레벨**:
- `debug` - 상세 디버깅
- `info` - 일반 정보 (기본값)
- `warn` - 경고
- `error` - 에러만

---

## 데이터 흐름

### 전체 실행 흐름

```
1. 사용자 입력
   $ mono-gen generate -i app.zip -o ./output

2. CLI Layer (cli.ts)
   ├─ Commander.js가 옵션 파싱
   └─ { input: 'app.zip', output: './output' }

3. Engine Layer (engine.ts)
   ├─ $engine.generateCmd.execute(options) 호출

4. Command Layer (cmd-generate.ts)
   ├─ GenerateCommand.execute()
   └─ service.generate(options) 호출

5. Service Layer (generator-service.ts)
   ├─ ConfigService.load() → config
   ├─ prepareInput(config) → inputPath
   ├─ cloneTemplate(config) → outputPath
   ├─ extractFiles()
   ├─ refactorBackend()
   │   ├─ TemplateService.loadPrompt('backend')
   │   └─ GeminiService.refactor()
   ├─ refactorFrontend()
   │   ├─ TemplateService.loadPrompt('frontend')
   │   └─ GeminiService.refactor()
   └─ return RefactorResult

6. Command Layer (cmd-generate.ts)
   ├─ 결과 수신
   └─ 사용자에게 출력 (console.log)

7. 사용자 출력
   ✅ Generation completed!
   Files processed: 10
   Tokens used: 1234
```

---

## 주요 컴포넌트

### 1. 설정 병합 알고리즘 (ConfigService)

```typescript
// 우선순위: CLI > File > Env > Defaults
const merged = {
    inputPath: options.input          // CLI (최우선)
            || fileConfig.inputPath   // File
            || envConfig.inputPath    // Env
            || defaults.inputPath,    // Defaults

    gemini: {
        apiKey: envConfig.gemini.apiKey      // Env only (보안)
             || fileConfig.gemini.apiKey
             || defaults.gemini.apiKey,

        model: fileConfig.gemini.model       // File > Env
            || envConfig.gemini.model
            || defaults.gemini.model,
    }
};
```

### 2. 템플릿 시스템 (TemplateService)

**디렉토리 구조**:
```
templates/default/
├── backend/
│   ├── config.json          # 파일 매핑 설정
│   ├── system.md            # AI 시스템 프롬프트
│   └── user.md              # AI 유저 프롬프트 (Mustache)
└── frontend/
    ├── config.json
    ├── system.md
    └── user.md
```

**config.json 예시**:
```json
{
  "name": "default-backend",
  "fileMap": {
    "serviceCode": "apps/backend/src/services/geminiService.ts",
    "apiCode": "apps/backend/src/api/hello-api.ts"
  },
  "outputMap": {
    "serviceCode": "apps/backend/src/services/geminiService.ts"
  },
  "optional": ["typeCode"]
}
```

**프롬프트 렌더링**:
```typescript
// user.md에 {{serviceCode}} 변수 사용
const template = "리팩토링할 코드:\n```typescript\n{{serviceCode}}\n```";

// 렌더링
const rendered = templateService.renderPrompt(template, {
    serviceCode: "export const service = ..."
});
```

### 3. Gemini API 통합 (GeminiService)

**API 호출 구조**:
```typescript
const model = client.getGenerativeModel({
    model: 'gemini-2.0-flash-exp',
    systemInstruction: systemPrompt  // AI 역할
});

const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
    generationConfig: {
        temperature: 0.8,
        topP: 0.95,
        maxOutputTokens: 8192
    }
});

const content = result.response.text();
const tokens = result.response.usageMetadata?.totalTokenCount;
```

---

## 의존성 관계

### Dependency Graph

```
cli.ts
  └─→ engine.ts
       ├─→ ConfigService
       ├─→ TemplateService
       ├─→ GeminiService
       ├─→ GeneratorService
       │    ├─→ ConfigService      (DI)
       │    ├─→ TemplateService    (DI)
       │    └─→ GeminiService      (DI)
       ├─→ GenerateCommand
       │    └─→ GeneratorService   (DI)
       ├─→ InitCommand
       │    ├─→ ConfigService      (DI)
       │    └─→ TemplateService    (DI)
       ├─→ ValidateCommand
       │    ├─→ ConfigService      (DI)
       │    └─→ GeminiService      (DI)
       └─→ ListCommand
            └─→ TemplateService    (DI)
```

---

## 일반적인 작업 시나리오

### 시나리오 1: 새로운 CLI 명령어 추가

**예시**: `mono-gen export` 명령어 추가

1. **Service 생성** (`service/export-service.ts`):
```typescript
export class ExportService extends AbstractService {
    public constructor() {
        super('export');
    }

    public hello = () => `export-service:${this.name}`;

    public async export(options: any): Promise<void> {
        // 비즈니스 로직
    }
}
```

2. **Command 생성** (`commands/cmd-export.ts`):
```typescript
export class ExportCommand extends AbstractCommand {
    public constructor(private readonly service: ExportService) {
        super('export');
    }

    public async execute(options: any): Promise<void> {
        const result = await this.service.export(options);
        console.log(chalk.green('✅ Export complete!'));
    }
}
```

3. **Engine 등록** (`engine.ts`):
```typescript
import ExportService from './service/export-service';
import ExportCommand from './commands/cmd-export';

const exportService = new ExportService();
const exportCmd = new ExportCommand(exportService);

export const $engine = {
    // ...
    exportService,
    exportCmd,
};
```

4. **CLI 등록** (`cli.ts`):
```typescript
program
    .command('export')
    .description('Export monorepo')
    .option('-f, --format <type>', 'Export format')
    .action(async (options) => {
        const { $engine } = require('./engine');
        await $engine.exportCmd.execute(options);
    });
```

### 시나리오 2: 새로운 설정 옵션 추가

**예시**: `projectDescription` 설정 추가

1. **타입 정의** (`cores/types.ts`):
```typescript
export interface GeneratorConfig {
    projectName: string;
    projectDescription?: string;  // 추가
    // ...
}
```

2. **ConfigService 수정** (`service/config-service.ts`):
```typescript
private merge(...): GeneratorConfig {
    return {
        // ...
        projectDescription: options.description
                         || fileConfig.projectDescription
                         || defaults.projectDescription,
    };
}
```

3. **CLI 옵션 추가** (`cli.ts`):
```typescript
program
    .command('generate')
    .option('-d, --description <text>', 'Project description')
    // ...
```

### 시나리오 3: 새로운 템플릿 추가

**예시**: `serverless` 템플릿 추가

1. **디렉토리 생성**:
```bash
mkdir -p src/templates/serverless/backend
mkdir -p src/templates/serverless/frontend
```

2. **설정 파일 작성** (`templates/serverless/backend/config.json`):
```json
{
  "name": "serverless-backend",
  "description": "Serverless backend with AWS Lambda",
  "fileMap": {
    "serviceCode": "apps/backend/src/services/geminiService.ts"
  },
  "outputMap": {
    "serviceCode": "apps/backend/src/lambda/handler.ts"
  }
}
```

3. **프롬프트 작성** (`templates/serverless/backend/system.md`, `user.md`)

4. **사용**:
```bash
mono-gen generate -i app.zip -o output -t serverless
```

---

## 디버깅 가이드

### 로그 레벨 활성화

```bash
# 상세 로깅
mono-gen generate -i app.zip -o output --log-level debug

# 환경 변수로 설정
export LOG_LEVEL=debug
mono-gen generate -i app.zip -o output
```

### API 요청/응답 로그 저장

```json
// .mono-gen.json
{
  "logging": {
    "level": "debug",
    "saveLogs": true,
    "logDir": "./logs"
  }
}
```

생성되는 파일:
- `logs/backend-refactor.log` - 백엔드 리팩토링 로그
- `logs/frontend-refactor.log` - 프론트엔드 리팩토링 로그

### 일반적인 문제 해결

**문제**: "Module not found"
- **원인**: 의존성 미설치
- **해결**: `npm install`

**문제**: "GEMINI_API_KEY not set"
- **원인**: 환경 변수 미설정
- **해결**: `export GEMINI_API_KEY="your-key"`

**문제**: 서비스 초기화 에러
- **원인**: 순환 참조
- **해결**: `engine.ts`에서 의존성 순서 확인

---

## 확장 포인트

### 1. 새로운 AI 모델 통합

`GeminiService`를 확장하여 다른 AI 모델 지원:

```typescript
export class OpenAIService extends AbstractService {
    public async refactor(...) {
        // OpenAI API 호출
    }
}
```

### 2. 플러그인 시스템

향후 플러그인 시스템 추가 가능:

```typescript
// plugins/my-plugin.ts
export class MyPlugin {
    public async beforeRefactor(code: string): Promise<string> {
        // 전처리
        return code;
    }
}
```

### 3. 커스텀 템플릿 로더

외부 URL에서 템플릿 로드:

```typescript
public async loadFromUrl(url: string): Promise<TemplatePreset> {
    const response = await fetch(url);
    const config = await response.json();
    return config;
}
```
---

**최종 수정**: 2025-11-13
**버전**: 0.0.1
