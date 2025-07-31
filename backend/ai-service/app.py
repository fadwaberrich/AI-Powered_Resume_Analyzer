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

    # Extract nouns/verbs from job description as required keywords
    doc = nlp(job_desc)
    keywords = set([token.lemma_.lower() for token in doc if token.pos_ in ["NOUN", "VERB", "PROPN"] and not token.is_stop])

    resume_doc = nlp(resume_text.lower())
    resume_words = set([token.lemma_ for token in resume_doc])

    matched = keywords.intersection(resume_words)
    missing = keywords.difference(resume_words)

    score = int((len(matched) / len(keywords)) * 100) if keywords else 0

    return jsonify({
        "score": score,
        "matchedKeywords": list(matched),
        "missingKeywords": list(missing),
        "suggestions": [
            "Include more relevant job-specific keywords.",
            "Add achievements with measurable outcomes.",
            "Ensure technical and soft skills are clearly mentioned."
        ]
    })

if __name__ == '__main__':
    app.run(port=6000)
