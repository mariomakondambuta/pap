async function loadFeaturedCourses() {
  const container = document.getElementById('featured-courses');
  try {
    const { courses } = await Api.request('/courses');
    document.getElementById('stat-courses').textContent = courses.length;
    const totalStudents = courses.reduce((sum, c) => sum + Number(c.student_count || 0), 0);
    document.getElementById('stat-students').textContent = totalStudents;

    if (courses.length === 0) {
      container.innerHTML = `<div class="empty-state"><div class="icon">📭</div>Ainda não há cursos publicados.</div>`;
      return;
    }

    container.innerHTML = courses.slice(0, 3).map(courseCardHtml).join('');
  } catch (err) {
    container.innerHTML = `<div class="empty-state">Não foi possível carregar os cursos.</div>`;
  }
}

loadFeaturedCourses();
