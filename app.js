const { createApp } = Vue;

createApp({
  data() {
    return {
      loading: true,
      error: '',
      questions: [],
      questionMap: {},
      queue: [],
      currentQuestion: null,
      renderedOptions: [],
      selectedKey: null,
      hasAnswered: false,
      lastAnswerCorrect: false,
      stats: {
        seen: 0,
        correct: 0,
        wrong: 0,
        round: 1,
      },
    };
  },
  computed: {
    compactLayout() {
      if (!this.renderedOptions.length) return false;
      return this.renderedOptions.every((option) => {
        const text = (option.text || '').trim();
        return text.length <= 24 && text.split(/\s+/).length <= 3;
      });
    },
    correctOptionKey() {
      return this.currentQuestion?.correctOption || '';
    },
    remainingInRound() {
      return this.queue.length;
    },
    accuracy() {
      const total = this.stats.correct + this.stats.wrong;
      if (!total) return 0;
      return Math.round((this.stats.correct / total) * 100);
    },
  },
  methods: {
    async loadQuestions() {
      try {
        const response = await fetch('./data/questions.json', { cache: 'no-store' });
        if (!response.ok) {
          throw new Error('Sorular yüklenemedi.');
        }

        const payload = await response.json();
        const items = Array.isArray(payload?.data) ? payload.data : [];

        if (!items.length) {
          throw new Error('Soru verisi boş görünüyor.');
        }

        this.questions = items;
        this.questionMap = Object.fromEntries(items.map((question) => [question.id, question]));
        this.resetQueue();
        this.nextQuestion();
      } catch (err) {
        this.error = err?.message || 'Beklenmeyen bir hata oluştu.';
      } finally {
        this.loading = false;
      }
    },
    shuffle(list) {
      const copy = [...list];
      for (let i = copy.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    },
    resetQueue() {
      this.queue = this.shuffle(this.questions.map((question) => question.id));
      if (this.stats.seen > 0) {
        this.stats.round += 1;
      }
    },
    buildRenderedOptions() {
      if (!this.currentQuestion) {
        this.renderedOptions = [];
        return;
      }

      const optionKeys = ['o1', 'o2', 'o3', 'o4'];
      const options = optionKeys
        .map((key) => ({
          key,
          text: this.currentQuestion[key],
          isCorrect: key === this.currentQuestion.correctOption,
        }))
        .filter((option) => typeof option.text === 'string' && option.text.trim().length > 0);

      this.renderedOptions = this.shuffle(options);
      this.selectedKey = null;
      this.hasAnswered = false;
      this.lastAnswerCorrect = false;
    },
    nextQuestion() {
      if (!this.questions.length) return;
      if (!this.queue.length) {
        this.resetQueue();
      }

      const nextId = this.queue.pop();
      this.currentQuestion = this.questionMap[nextId];
      this.stats.seen += 1;
      this.buildRenderedOptions();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    selectOption(option) {
      if (this.hasAnswered) return;

      this.selectedKey = option.key;
      this.hasAnswered = true;
      this.lastAnswerCorrect = option.isCorrect;

      if (option.isCorrect) {
        this.stats.correct += 1;
      } else {
        this.stats.wrong += 1;
      }
    },
    retryQuestion() {
      if (!this.currentQuestion) return;
      this.buildRenderedOptions();
    },
    optionClass(option) {
      if (!this.hasAnswered) return 'option-button';

      const classes = ['option-button'];

      if (option.isCorrect) {
        classes.push('is-correct');
      }

      if (this.selectedKey === option.key && !option.isCorrect) {
        classes.push('is-wrong');
      }

      if (this.selectedKey === option.key) {
        classes.push('is-selected');
      }

      return classes.join(' ');
    },
  },
  mounted() {
    this.loadQuestions();
  },
  template: `
    <main class="app-shell">
      <div class="backdrop-heart heart-1">♥</div>
      <div class="backdrop-heart heart-2">♥</div>
      <div class="backdrop-flower flower-1">✿</div>
      <div class="backdrop-flower flower-2">❀</div>

      <section class="quiz-card">
        <header class="hero-banner">
          <p class="hero-kicker">İnkılap Tarihi Quiz</p>
          <h1>645 soruluk tatlı çalışma ekranı</h1>
          <p class="hero-text">Sorular karışık gelir, şıkların yeri sürekli değişir, yanlışta tekrar deneyebilirsin.</p>
        </header>

        <section v-if="loading" class="state-card">
          <div class="loader"></div>
          <p>Sorular hazırlanıyor...</p>
        </section>

        <section v-else-if="error" class="state-card error-state">
          <h2>Bir sorun oluştu</h2>
          <p>{{ error }}</p>
        </section>

        <template v-else>
          <section class="stats-strip">
            <div class="stat-pill">
              <span class="stat-label">Toplam</span>
              <strong>{{ questions.length }}</strong>
            </div>
            <div class="stat-pill">
              <span class="stat-label">Tur</span>
              <strong>{{ stats.round }}</strong>
            </div>
            <div class="stat-pill">
              <span class="stat-label">Çözülen</span>
              <strong>{{ stats.seen }}</strong>
            </div>
            <div class="stat-pill">
              <span class="stat-label">Doğru</span>
              <strong>{{ stats.correct }}</strong>
            </div>
            <div class="stat-pill">
              <span class="stat-label">Yanlış</span>
              <strong>{{ stats.wrong }}</strong>
            </div>
            <div class="stat-pill">
              <span class="stat-label">Başarı</span>
              <strong>%{{ accuracy }}</strong>
            </div>
          </section>

          <section class="question-card" v-if="currentQuestion">
            <div class="question-topline">
              <span class="badge">Kalan {{ remainingInRound }}</span>
              <span class="badge accent">Soru #{{ currentQuestion.id }}</span>
            </div>

            <h2 class="question-text">{{ currentQuestion.question }}</h2>

            <div :class="compactLayout ? 'options-grid compact-grid' : 'options-grid stacked-grid'">
              <button
                v-for="option in renderedOptions"
                :key="option.key + '-' + option.text"
                :class="optionClass(option)"
                @click="selectOption(option)"
                type="button"
              >
                <span class="option-letter">{{ option.key.toUpperCase() }}</span>
                <span class="option-text">{{ option.text }}</span>
              </button>
            </div>

            <div v-if="hasAnswered" class="feedback-box" :class="lastAnswerCorrect ? 'feedback-good' : 'feedback-bad'">
              <p v-if="lastAnswerCorrect">Doğru cevap seçildi. Harika, devam edebilirsin.</p>
              <p v-else>
                Yanlış seçim yapıldı. Doğru şık yeşil ile gösterildi.
                İstersen tekrar deneyip şıkları yeniden karıştırabilirsin.
              </p>
            </div>

            <div v-if="hasAnswered" class="action-row">
              <button class="action-button next-button" @click="nextQuestion" type="button">
                Sonraki soru
              </button>
              <button
                v-if="!lastAnswerCorrect"
                class="action-button retry-button"
                @click="retryQuestion"
                type="button"
              >
                Tekrar dene
              </button>
            </div>
          </section>
        </template>
      </section>
    </main>
  `,
}).mount('#app');
