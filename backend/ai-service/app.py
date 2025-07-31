from flask import Flask, request, jsonify
import spacy

app = Flask(__name__)
nlp = spacy.load("en_core_web_sm")

@app.route('/analyze', methods=['POST'])
def analyze_resume():
    data = request.json
    resume_text = data.get("resumeText", "")
    job_desc = data.get("jobDescription", "")

    if not resume_text or not job_desc:
        return jsonify({"error": "Missing input"}), 400

    doc = nlp(job_desc)
    keywords = set([token.lemma_.lower() for token in doc if token.pos_ in ["NOUN", "VERB", "PROPN"] and not token.is_stop])

    resume_doc = nlp(resume_text.lower())
    resume_words = set([token.lemma_ for token in resume_doc])

    matched = keywords.intersection(resume_words)
    missing = keywords.difference(resume_words)

    score = int((len(matched) / len(keywords)) * 100) if keywords else 0

    # Dynamic suggestions
    suggestions = []

    if score < 70:
        suggestions.append("Improve keyword relevance to better match the job description.")
    if "python" in missing:
        suggestions.append("Mention Python if you have experience — it's important for this job.")
    if "docker" in missing:
        suggestions.append("Include Docker experience or certification if you have it.")
    if "team" not in resume_words:
        suggestions.append("Consider including teamwork or collaboration experience.")
    if "project" not in resume_words:
        suggestions.append("Add details about specific projects or outcomes.")

    if not suggestions:
        suggestions.append("Great job! Your resume aligns well with the job requirements.")

    return jsonify({
        "score": score,
        "matchedKeywords": list(matched),
        "missingKeywords": list(missing),
        "suggestions": suggestions
    })

if __name__ == '__main__':
    app.run(port=6000)
